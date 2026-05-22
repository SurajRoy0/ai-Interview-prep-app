import { Job } from 'bullmq'
import { prisma } from '@repo/db'
import { generateAtsReport } from '@repo/ai'
import type { ParsedResumeData } from '@repo/shared'

export default async function atsProcessor(job: Job) {
  const { jobProfileId } = job.data

  console.log(`[ATS Worker] Generating report for Profile: ${jobProfileId}`)

  const profile = await prisma.jobProfile.findUnique({
    where: { id: jobProfileId },
    include: { resume: true }
  })

  if (!profile || !profile.resume) {
    throw new Error('Profile or Resume not found')
  }

  // Create or Update ATS Report as PROCESSING
  await prisma.aTSReport.upsert({
    where: { jobProfileId },
    update: { status: 'PROCESSING' },
    create: {
      jobProfileId: profile.id,
      userId: profile.userId,
      resumeId: profile.resumeId as string,
      status: 'PROCESSING'
    }
  })

  try {
    const parsedData = profile.resume.parsedData as unknown as ParsedResumeData
    
    // Generate AI Report
    console.log(`[ATS Worker] Asking Gemini to score against role: ${profile.targetRole}...`)
    const report = await generateAtsReport(parsedData, profile.targetRole)

    // Save report and mark DONE
    await prisma.aTSReport.update({
      where: { jobProfileId },
      data: {
        ...report,
        strengths: report.strengths,
        missingKeywords: report.missingKeywords,
        criticalIssues: report.criticalIssues,
        suggestions: report.suggestions,
        status: 'DONE',
        generatedAt: new Date(),
      }
    })

    console.log(`[ATS Worker] Successfully generated ATS for Profile: ${jobProfileId}`)
  } catch (error) {
    console.error(`[ATS Worker] Failed ATS generation ${jobProfileId}:`, error)
    await prisma.aTSReport.update({
      where: { jobProfileId },
      data: { status: 'FAILED' }
    })
    throw error
  }
}
