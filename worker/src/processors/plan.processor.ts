import { Job } from 'bullmq'
import { prisma } from '@repo/db'

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
      include: { resume: true }
    })

    if (!interview) {
      throw new Error(`Interview ${interviewId} not found`)
    }

    // 2. Here we would normally call the AI planner
    // For now, we simulate the LLM delay
    await new Promise(resolve => setTimeout(resolve, 4000))

    // Create a mock generated plan
    const mockPlan = {
      topics: [
        { intent: 'CONFIDENCE_CHECK', topic: 'Resume Walkthrough' },
        { intent: 'DEPTH_PROBE', topic: 'Technical Skills' }
      ]
    }

    // 3. Mark as DONE and save plan
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        planStatus: 'DONE',
        planGenerated: true,
        interviewPlan: mockPlan,
      }
    })

    console.log(`[PlanWorker] Successfully generated plan for interview ${interviewId}`)
    return { success: true }
  } catch (error: any) {
    console.error(`[PlanWorker] Failed to process interview ${interviewId}:`, error)
    
    // Mark as failed in DB if this is the last attempt, or just let BullMQ handle retry
    // It's good to update the DB so UI knows it failed
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        planStatus: 'FAILED',
        planError: error.message || 'Unknown error occurred during plan generation'
      }
    })

    throw error // Let BullMQ retry
  }
}
