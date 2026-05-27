import { Job } from 'bullmq'
import { prisma } from '@repo/db'
import { parseResumeWithAI } from '@repo/ai'
import type { ParsedResume } from '@repo/shared'

export async function processResumeJob(job: Job<{ resumeId: string }>) {
  const { resumeId } = job.data
  console.log(`[ResumeWorker] Starting processing for resume ${resumeId}`)

  const resume = await prisma.resume.findUnique({
    where: { id: resumeId },
    include: { jobProfile: true },
  })

  if (!resume) throw new Error('Resume not found in database')

  if (resume.parseStatus !== 'PENDING') {
    console.log(`[ResumeWorker] Resume ${resumeId} is already ${resume.parseStatus}. Skipping.`)
    return
  }

  await prisma.resume.update({
    where: { id: resumeId },
    data: { parseStatus: 'PROCESSING', parseError: null },
  })

  try {
    let config = await prisma.planConfig.findFirst({ where: { isDefault: true } })
    const subscription = await prisma.subscription.findFirst({
      where: { userId: resume.jobProfile.userId, status: "ACTIVE" },
      include: { plan: { include: { planConfig: true } } }
    })
    
    if (subscription?.plan?.planConfig) {
      config = subscription.plan.planConfig
    }
    
    if (!config) throw new Error("No plan configuration found")

    const parsedData: ParsedResume = await parseResumeWithAI(
      resume.rawText,
      resume.jobProfile.targetRole,
      {
        parseFullResume: config.parseFullResume,
        maxProjectsToExtract: config.maxProjectsToExtract,
        maxSkillsPerCategory: config.maxSkillsPerCategory,
        maxExperienceYears: config.maxExperienceYears,
      }
    )

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        parseStatus: 'DONE',
        parsedData: parsedData as unknown as Parameters<typeof prisma.resume.update>[0]['data']['parsedData'],
        ecosystem: parsedData.suggestedEcosystem,
      },
    })

    if (!resume.jobProfile.ecosystem && parsedData.suggestedEcosystem) {
      await prisma.jobProfile.update({
        where: { id: resume.jobProfile.id },
        data: { ecosystem: parsedData.suggestedEcosystem },
      })
    }

    console.log(`[ResumeWorker] Successfully processed resume ${resumeId}`)
  } catch (error) {
    console.error(`[ResumeWorker] Failed to process resume ${resumeId}:`, error)

    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        parseStatus: 'FAILED',
        parseError: error instanceof Error ? error.message : String(error),
      },
    })

    throw error
  }
}
