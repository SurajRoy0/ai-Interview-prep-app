import { Job } from "bullmq";
import { prisma } from "@repo/db";
import { evaluateTopicWithAI } from "@repo/ai";
import { logger } from "@repo/shared";

export async function processTopicJudgingJob(
  job: Job<{ interviewId: string; topicId: string }>,
) {
  const { interviewId, topicId } = job.data;

console.log(`[JudgeWorker] Processing job ${job.id} for interview ${interviewId}, topic ${topicId}`);

  try {
    const topic = await prisma.interviewTopic.findUnique({
      where: { id: topicId },
      include: {
        turns: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!topic) {
      throw new Error(`Interview topic ${topicId} not found`);
    }

    if(topic.judgedAt) {
      logger.info(
        {
          interviewId,
          topicId,
        },
        "Topic has already been judged",
      );
      return;
    }

    const judgeTopic = {
      intent: topic.plannedIntent ?? "UNKNOWN",
      category: topic.plannedCategory ?? "UNKNOWN",
      reasoning: topic.reasoning ?? "No reasoning provided",
      activityType: topic.activityType ?? null,
      targetSkills: topic.targetSkills ?? [],
      plannedDifficulty: topic.plannedDifficulty ?? "UNKNOWN"
    };

    const transcript: {
      role: "AI" | "USER";
      content: string;
    }[] = topic.turns.map((turn) => ({
      role: turn.role === "AI" ? "AI" : "USER",
      content: turn.content ?? "",
    }));

    const result = await evaluateTopicWithAI(judgeTopic, transcript);

    await prisma.interviewTopic.update({
      where: {
        id: topicId,
      },
      data: {
        judgeSummary: result.judgeSummary,
        judgeScore: result.judgeScore,

        judgeStrengths: result.judgeStrengths,
        judgeWeaknesses: result.judgeWeaknesses,

        judgePending: false,
        judgedAt: new Date(),
      },
    });

    logger.info(
      {
        interviewId,
        topicId,
        score: result.judgeScore,
      },
      "Topic judged successfully",
    );
  } catch (error) {
  logger.error(
    {
      error,
      interviewId,
      topicId,
    },
    "Error processing topic judging job",
  );

  await prisma.interviewTopic.update({
    where: {
      id: topicId,
    },
    data: {
      judgeRetryCount: {
        increment: 1,
      },
    },
  });

  throw error;
}
}
