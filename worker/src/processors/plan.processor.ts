import { Job } from 'bullmq'
import { prisma } from '@repo/db'
import { generateInterviewPlanWithAI } from '@repo/ai'
import { type ConfigInput, type ParsedResume } from '@repo/shared'

export async function processInterviewPlanJob(job: Job<{ interviewId: string }>) {
  const { interviewId } = job.data

  console.log(`[PlanWorker] Processing job ${job.id} for interview ${interviewId}`)

  try {
    // 1. Mark as processing
    await prisma.interview.update({
      where: { id: interviewId },
      data: { planStatus: 'PROCESSING', planError: null }
    })

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: { jobProfile: true }
    })

    if (!interview) {
      throw new Error(`Interview ${interviewId} not found`)
    }

    const config = interview.planConfigSnapshot as ConfigInput
    const resumeData = interview.resumeSnapshot as ParsedResume
    const targetTurns = config.targetTurns || 8

    // 2. Call the AI planner
    const hasActivities = Boolean(config.activityConfig && Object.keys(config.activityConfig).length > 0)
    const plan = await generateInterviewPlanWithAI(
      interview.jobProfile.targetRole,
      interview.jobProfile.experienceLevel,
      resumeData,
      {
        targetTurns,
        interviewType: interview.type,
        allowActivities: hasActivities,
        activityConfig: config.activityConfig as unknown as Record<string, number>
      }
    )

    // 3. Mark as DONE and save plan
    await prisma.$transaction(async (tx) => {
      await tx.interview.update({
        where: { id: interviewId },
        data: {
          planStatus: 'DONE',
          planGenerated: true,
          interviewPlan: plan,
          totalQuestions: targetTurns,
        }
      })

      // 4. Seed the InterviewQuestion records
      if (plan.topics && plan.topics.length > 0) {
        await tx.interviewQuestion.createMany({
          data: plan.topics.map((topic, index) => ({
            interviewId,
            questionIndex: index,
            type: topic.category === 'ACTIVITY' ? 'ACTIVITY' : 'QA',
            activityType: topic.activityType,
            status: 'PENDING',
            plannedCategory: topic.category,
            plannedIntent: topic.intent,
            targetSkills: topic.targetSkills,
            plannedDifficulty: topic.plannedDifficulty,
            timeLimitSeconds: topic.category === 'ACTIVITY' ? (config.activityTimeSecs || 300) : (config.questionTimeSecs || 120),
          }))
        })
      }
    })

    console.log(`[PlanWorker] Successfully generated plan for interview ${interviewId}`)
    return { success: true }
  } catch (error: unknown) {
    console.error(`[PlanWorker] Failed to process interview ${interviewId}:`, error)

    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred during plan generation'

    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        planStatus: 'FAILED',
        planError: errorMessage
      }
    })

    throw error // Let BullMQ retry
  }
}
