import { streamText, convertToCoreMessages } from 'ai'
import { getOpenAiModel, buildSessionSystemPrompt } from '@repo/ai'
import { prisma } from '@repo/db'
import { type ParsedResume, ConfigInput } from '@repo/shared'
import { getSession } from '@/lib/auth-server'

export async function POST(req: Request) {
  try {
    const session = await getSession()

    if (!session?.user) {
      return new Response('Unauthorized', { status: 401 })
    }

    const body = await req.json().catch(() => ({}))
    const { messages, interviewId, questionId } = body

    if (!interviewId || !questionId) {
      return new Response('Missing interviewId or questionId', { status: 400 })
    }

    // Load interview context
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId, userId: session.user.id },
      include: { jobProfile: true }
    })

    if (!interview) {
      return new Response('Interview not found', { status: 404 })
    }

    // Load the specific question context
    const question = await prisma.interviewQuestion.findUnique({
      where: { id: questionId, interviewId: interview.id }
    })

    if (!question) {
      return new Response('Question not found', { status: 404 })
    }

    // Load previous topic summaries for context
    const previousQuestions = await prisma.interviewQuestion.findMany({
      where: {
        interviewId: interview.id,
        status: 'CLOSED',
        questionIndex: { lt: question.questionIndex }
      },
      orderBy: { questionIndex: 'asc' },
      select: { judgeSummary: true }
    })

    const previousTopicSummaries = previousQuestions
      .map(q => q.judgeSummary)
      .filter((s): s is string => s !== null)

    // Calculate current follow-up count based on messages
    // Since the first message is the AI's opening, every user message counts as a turn.
    // If messages length is empty, it's 0. If messages has [AI, User], that's 1 follow-up requested.
    // We can roughly use the number of user messages in the array.
    const userMessageCount = (messages || []).filter((m: any) => m.role === 'user').length
    const currentFollowUpCount = Math.max(0, userMessageCount - 1) // First user message might be "I am ready", subsequent ones are actual follow-ups
    
    // Fetch configuration
    const config = interview.planConfigSnapshot as ConfigInput
    const maxFollowUps = config.maxFollowUpsPerTopic || 2

    // Fetch immediate previous question's raw transcript if its summary is not ready yet
    let previousTopicTranscript: string | undefined
    if (question.questionIndex > 0) {
      const immediatePreviousQuestion = await prisma.interviewQuestion.findFirst({
        where: { interviewId: interview.id, questionIndex: question.questionIndex - 1 },
        include: { turns: { orderBy: { createdAt: 'asc' } } }
      })
      if (immediatePreviousQuestion && !immediatePreviousQuestion.judgeSummary && immediatePreviousQuestion.turns.length > 0) {
        previousTopicTranscript = immediatePreviousQuestion.turns
          .map(t => `${t.role}: ${t.content}`)
          .join('\n')
      }
    }

    const systemPrompt = buildSessionSystemPrompt({
      targetRole: interview.jobProfile.targetRole,
      experienceLevel: interview.jobProfile.experienceLevel,
      resumeData: interview.resumeSnapshot as ParsedResume,
      intent: question.plannedIntent!,
      category: question.plannedCategory!,
      targetSkills: question.targetSkills,
      plannedDifficulty: question.plannedDifficulty!,
      currentTopicIndex: question.questionIndex,
      totalTopics: interview.totalQuestions,
      previousTopicSummaries,
      previousTopicTranscript,
      currentFollowUpCount,
      maxFollowUps
    })

    // Get model choice from plan config
    // const config = interview.planConfigSnapshot as ConfigInput
    // We can default to mini if not specified
    // const modelStr = config.interviewModel || 'gpt-4o-mini'
    let chatMessages = messages ? convertToCoreMessages(messages) : []
    if (chatMessages.length === 0) {
      chatMessages = [{
        role: 'user',
        content: 'I am ready. Please introduce the topic and ask the first question.'
      }]
    }

    const result = streamText({
      model: getOpenAiModel(), // Forcing OpenAI model for now per requirements
      messages: chatMessages,
      system: systemPrompt,
      onFinish: async (info) => {
        console.log('[Chat API] Stream finished. Tokens:', info.usage)
      }
    })

    return result.toUIMessageStreamResponse()
  } catch (error) {
    console.error('[Chat API] Error:', error)
    if (error instanceof Error) {
      return new Response(error.message, { status: 500 })
    }
    return new Response('Internal Server Error', { status: 500 })
  }
}
