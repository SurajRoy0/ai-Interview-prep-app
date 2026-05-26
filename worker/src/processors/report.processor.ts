import { Job } from 'bullmq';
import { prisma } from '@repo/db';
import { generateInterviewReport } from '@repo/ai';

export async function processReportJob(job: Job<{ interviewId: string }>) {
  const { interviewId } = job.data;
  console.log(`[ReportWorker] Starting report generation for interview ${interviewId}`);

  try {
    const interview = await prisma.interview.findUnique({
      where: { id: interviewId },
      include: { turns: { orderBy: { turnIndex: 'asc' } }, jobProfile: true }
    });

    if (!interview) throw new Error('Interview not found in database');

    if (interview.status === 'COMPLETED') {
      console.log(`[ReportWorker] Interview ${interviewId} already COMPLETED. Skipping.`);
      return;
    }

    // Reconstruct the transcript
    const transcript = interview.turns.map(t =>
      `${t.role === 'USER' ? 'Candidate' : 'Interviewer'}: ${t.question || t.answer || ''}`
    ).join('\n');

    if (!transcript.trim()) {
      throw new Error('No transcript found — interview has no turns');
    }

    // Call @repo/ai — the correct place for all AI logic
    const plan = interview.interviewPlan as any;
    const report = await generateInterviewReport({
      targetRole: interview.jobProfile.targetRole,
      transcript,
      interviewPlan: plan,
    });

    // Save results to DB and mark COMPLETED
    await prisma.interview.update({
      where: { id: interviewId },
      data: {
        status: 'COMPLETED',
        overallScore: report.overallScore,
        technicalScore: report.technicalScore,
        communicationScore: report.communicationScore,
        feedback: report.feedback,
        strongTopics: report.strongTopics,
        weakTopics: report.weakTopics,
        completedAt: new Date()
      }
    });

    console.log(`[ReportWorker] Successfully generated report for interview ${interviewId}`);
  } catch (error) {
    console.error(`[ReportWorker] Failed to generate report for interview ${interviewId}:`, error);

    await prisma.interview.update({
      where: { id: interviewId },
      data: { status: 'FAILED' }
    });

    throw error;
  }
}
