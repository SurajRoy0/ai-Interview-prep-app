import { Job } from 'bullmq';
import { prisma } from '@repo/db';
import { parseResumeWithAI } from '@repo/ai';

export async function processResumeJob(job: Job<{ resumeId: string }>) {
  const { resumeId } = job.data;
  console.log(`[ResumeWorker] Starting processing for resume ${resumeId}`);

  try {
    // 1. Fetch the resume and ensure it exists and is PENDING
    const resume = await prisma.resume.findUnique({
      where: { id: resumeId },
      include: { jobProfile: true }
    });

    if (!resume) throw new Error('Resume not found in database');
    if (resume.parseStatus !== 'PENDING') {
      console.log(`[ResumeWorker] Resume ${resumeId} is already ${resume.parseStatus}. Skipping.`);
      return;
    }

    // 2. Mark as PROCESSING and clear any previous error
    await prisma.resume.update({
      where: { id: resumeId },
      data: { parseStatus: 'PROCESSING', parseError: null }
    });

    // 3. Call AI to parse the raw text
    const parsedData = await parseResumeWithAI(resume.rawText, resume.jobProfile.targetRole);

    // 4. Save results to DB
    await prisma.resume.update({
      where: { id: resumeId },
      data: {
        parseStatus: 'DONE',
        parsedData: parsedData as any,
        ecosystem: parsedData.suggestedEcosystem
      }
    });

    // 5. Optionally update the JobProfile ecosystem if it was null
    if (!resume.jobProfile.ecosystem && parsedData.suggestedEcosystem) {
      await prisma.jobProfile.update({
        where: { id: resume.jobProfile.id },
        data: { ecosystem: parsedData.suggestedEcosystem }
      });
    }

    console.log(`[ResumeWorker] Successfully processed resume ${resumeId}`);
  } catch (error) {
    console.error(`[ResumeWorker] Failed to process resume ${resumeId}:`, error);
    
    await prisma.resume.update({
      where: { id: resumeId },
      data: { 
        parseStatus: 'FAILED',
        parseError: error instanceof Error ? error.message : String(error)
      }
    });

    throw error;
  }
}
