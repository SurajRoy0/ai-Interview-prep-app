'use client'

import { useEffect } from 'react'
import { readStreamableValue } from '@ai-sdk/rsc'
import { parseAITurnResponse } from '@repo/ai/browser'
import { useInterviewStore } from '@/store/interview-store'
import { submitTurnAction, recoverInterviewAction, startFirstTurnAction } from '@/actions/interview'
import { ActivityPanel } from '@/components/interview/ActivityPanel'
import { InterviewHeader } from '@/components/interview/InterviewHeader'
import { ConversationView } from '@/components/interview/ConversationView'
import { InputZone } from '@/components/interview/InputZone'
import { LiveTranscript } from '@/components/interview/LiveTranscript'

export function ActiveInterview({ interviewId }: { interviewId: string }) {
  const store = useInterviewStore()

  useEffect(() => {
    store.setInterviewId(interviewId)

    recoverInterviewAction(interviewId).then((res) => {
      if (res.success && res.data) {
        store.rebuildFromRecovery(res.data)
        if (res.data.currentTurnIndex === 0) {
          handleFirstTurn()
        }
      }
    })

    return () => {
      store.reset()
    }
  }, [interviewId])

  async function handleFirstTurn() {
    store.setPhase('ai_typing')
    store.setStreamingText('')
    
    const result = await startFirstTurnAction(interviewId)
    if (!result.success || !result.data) {
      store.setPhase('failed')
      return
    }

    let fullText = ''
    try {
      if (result.data.stream) {
        for await (const delta of readStreamableValue(result.data.stream)) {
          if (delta) {
            fullText += delta
            store.setStreamingText(fullText)
          }
        }
      }
      
      const parsed = parseAITurnResponse(fullText)
      store.finalizeAITurn(parsed.question ?? 'Could you elaborate?', parsed.suggestedInputMode ?? 'VOICE')
      store.setTurnMeta(1, result.data.totalTurns)
      store.setPhase('waiting_input')
    } catch (err) {
      console.error(err)
      store.setPhase('failed')
    }
  }

  async function handleSubmit(answer: string, inputMode: string) {
    if (store.phase !== 'waiting_input' && store.phase !== 'activity_active') return;

    store.addUserTurn(answer, inputMode)
    store.setPhase('ai_typing')
    store.setStreamingText('')

    const result = await submitTurnAction({ interviewId, answer, inputMode })

    if (!result.success || !result.data) {
      store.setPhase('failed')
      return
    }

    if (result.data.isCompleted) {
      store.setPhase('completed')
      window.location.href = `/interview/${interviewId}`
      return
    }

    if (result.data.activityNext) {
      store.setPhase('activity_active')
      return
    }

    let fullText = ''
    try {
      if (result.data.stream) {
        for await (const delta of readStreamableValue(result.data.stream)) {
          if (delta) {
            fullText += delta
            store.setStreamingText(fullText)
          }
        }
      }

      const parsed = parseAITurnResponse(fullText)
      store.finalizeAITurn(parsed.question ?? 'Could you elaborate?', parsed.suggestedInputMode ?? 'VOICE')
      store.setTurnMeta(store.currentTurnIndex + 1, store.totalTurns)
      store.setPhase('waiting_input')
    } catch (err) {
      console.error(err)
      store.setPhase('failed')
    }
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

        {store.phase === 'activity_active' && (
          <ActivityPanel
            interviewId={interviewId}
            onActivityComplete={(answer) => handleSubmit(answer, 'CODE_EDITOR')}
          />
        )}
      </div>
    </div>
  )
}
