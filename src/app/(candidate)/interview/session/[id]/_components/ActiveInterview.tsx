'use client'

import { useEffect } from 'react'
import { readStreamableValue } from '@ai-sdk/rsc'
import { useInterviewStore } from '@/store/interview-store'
import { submitTurnAction, recoverInterviewAction } from '@/actions/interview'
import { ActivityPanel } from '@/components/interview/ActivityPanel'
import { InterviewHeader } from '@/components/interview/InterviewHeader'
import { ConversationView } from '@/components/interview/ConversationView'
import { InputZone } from '@/components/interview/InputZone'
import { LiveTranscript } from '@/components/interview/LiveTranscript'

export function ActiveInterview({ interviewId }: { interviewId: string }) {
  const store = useInterviewStore()

  const setInterviewId = useInterviewStore(s => s.setInterviewId)
  const turnsLength = useInterviewStore(s => s.turns.length)
  const rebuildFromRecovery = useInterviewStore(s => s.rebuildFromRecovery)

  // On mount, recover interview state if refreshed
  useEffect(() => {
    setInterviewId(interviewId)

    // We only recover if we haven't loaded turns yet
    if (turnsLength === 0) {
      recoverInterviewAction(interviewId).then((res) => {
        if (res.success && res.data) {
          rebuildFromRecovery(res.data)
        }
      })
    }
  }, [interviewId, setInterviewId, rebuildFromRecovery]) // Remove turnsLength to prevent re-fetching if it stays 0

  async function handleSubmit(answer: string, inputMode: string) {
    store.addTurn({ turnIndex: store.currentTurnIndex, role: 'user', content: answer, inputMode })
    store.setPhase('ai_typing')
    store.setStreamingText('')

    const result = await submitTurnAction({ interviewId, answer, inputMode })

    if (!result.success || !result.data) {
      store.setPhase('failed')
      return
    }

    if (result.data.isCompleted) {
      window.location.href = `/interview/${interviewId}`
      return
    }

    if (result.data.activityNext) {
      // Trigger activity flow
      store.setPhase('activity_active')
      return
    }

    // Stream tokens
    let fullText = ''
    if (result.data.stream) {
      for await (const delta of readStreamableValue(result.data.stream)) {
        if (delta) {
          fullText += delta
          store.setStreamingText(fullText)
        }
      }
    }

    try {
      let jsonStr = fullText.trim()
      if (jsonStr.startsWith('\`\`\`json')) {
        jsonStr = jsonStr.replace(/^\`\`\`json/, '').replace(/\`\`\`$/, '').trim()
      } else if (jsonStr.startsWith('\`\`\`')) {
        jsonStr = jsonStr.replace(/^\`\`\`/, '').replace(/\`\`\`$/, '').trim()
      }
      const parsed = JSON.parse(jsonStr)
      store.finalizeAITurn(parsed.question || "Could you elaborate?", parsed.suggestedInputMode || "VOICE")
    } catch {
      store.finalizeAITurn("Could you elaborate?", "VOICE")
    }

    store.setPhase('waiting_input')
  }

  return (
    <div className="flex flex-col h-screen w-full bg-background overflow-hidden relative">
      <InterviewHeader />

      <div className="flex flex-1 overflow-hidden relative">
        <div className="flex flex-col flex-1 relative min-w-0">
          <ConversationView />
          <InputZone onSubmitTurn={handleSubmit} />
          <LiveTranscript />
        </div>

        {store.phase === 'activity_active' && <ActivityPanel interviewId={interviewId} />}
      </div>
    </div>
  )
}
