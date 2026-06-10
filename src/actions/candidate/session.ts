"use server";

import { prisma } from "@repo/db";
import { getSession } from "@/lib/auth-server";
import { ActionResult, success, failure } from "@/lib/action-result";
import { generateOpeningQuestion, generateFollowUp } from "@repo/ai";
import { createStreamableValue } from "@ai-sdk/rsc";
import type { TopicTurn, TurnType, TopicCloseReason } from "@repo/db";
import { judgeQueue } from "@/lib/queues";

// 1. Initialize the session: Check if pending, change to ACTIVE, return the initial topic and turns
export async function initializeSessionAction(
  interviewId: string,
): Promise<ActionResult<{ interview: unknown }>> {
  try {
    const session = await getSession();
    if (!session) return failure("Unauthorized", "UNAUTHORIZED");

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId, userId: session.user.id },
      include: {
        jobProfile: { include: { activeResume: true } },
        topics: {
          orderBy: { topicIndex: "asc" },
          include: { turns: { orderBy: { turnIndex: "asc" } } },
        },
      },
    });

    if (!interview) return failure("Interview not found", "NOT_FOUND");

    if (interview.status === "COMPLETED" || interview.status === "FAILED") {
      return failure("Interview already ended", "BAD_REQUEST");
    }

    // If it's pending, we activate it.
    if (interview.status === "PENDING") {
      // Find the first pending topic
      const firstTopic = interview.topics.find((t) => t.status === "PENDING");

      if (!firstTopic) return failure("No topics found", "INTERNAL_ERROR");

      // Transaction: Mark interview ACTIVE, and the first topic ACTIVE
      await prisma.$transaction([
        prisma.interview.update({
          where: { id: interviewId },
          data: { status: "ACTIVE" },
        }),
        prisma.interviewTopic.update({
          where: { id: firstTopic.id },
          data: {
            status: "ACTIVE",
            startedAt: new Date(),
          },
        }),
      ]);

      // Re-fetch to return the updated state
      const updatedInterview = await prisma.interview.findUnique({
        where: { id: interviewId },
        include: {
          topics: {
            orderBy: { topicIndex: "asc" },
            include: { turns: { orderBy: { turnIndex: "asc" } } },
          },
        },
      });

      return success({ interview: updatedInterview });
    }

    // If it's ACTIVE or PAUSED, just return it
    if (interview.status === "PAUSED") {
      // Mark it active again
      await prisma.interview.update({
        where: { id: interviewId },
        data: { status: "ACTIVE" },
      });
      interview.status = "ACTIVE";
    }

    return success({ interview });
  } catch (error: unknown) {
    console.error("[initializeSessionAction]", error);
    return failure("Failed to initialize session", "INTERNAL_ERROR");
  }
}

// 2. Stream the AI Turn
export async function streamAiTurnAction(
  interviewId: string,
  candidateResponse?: string,
) {
  const session = await getSession();
  if (!session) throw new Error("Unauthorized");

  // Fetch all necessary data
  const interview = await prisma.interview.findUnique({
    where: { id: interviewId, userId: session.user.id },
    include: {
      topics: {
        orderBy: { topicIndex: "asc" },
        include: { turns: { orderBy: { turnIndex: "asc" } } },
      },
    },
  });

  if (!interview || interview.status !== "ACTIVE") {
    throw new Error("Interview not active");
  }

  const activeTopic = interview.topics.find((t) => t.status === "ACTIVE");
  if (!activeTopic) {
    throw new Error("No active topic found");
  }

  // If candidate submitted an answer, save it first (even if it's an empty string from the timer)
  if (candidateResponse !== undefined) {
    const nextTurnIndex = activeTopic.turns.length;
    const isFollowUp = nextTurnIndex > 1; // AI asked opening (0), user answered (1), AI followed up (2), user answered (3)

    await prisma.topicTurn.create({
      data: {
        topicId: activeTopic.id,
        interviewId,
        turnIndex: nextTurnIndex,
        role: "USER",
        turnType: isFollowUp ? "FOLLOWUP_ANSWER" : "ANSWER",
        content: candidateResponse,
      },
    });
    // Re-fetch to include the new turn
    activeTopic.turns.push({
      id: "temp",
      topicId: activeTopic.id,
      interviewId,
      turnIndex: nextTurnIndex,
      role: "USER",
      turnType: isFollowUp ? "FOLLOWUP_ANSWER" : "ANSWER",
      content: candidateResponse,
      moveToNext: false,
      suggestedInputMode: null,
      latencyMs: null,
      streamingLatencyMs: null,
      timeUsedSeconds: null,
      tokenUsage: null,
      createdAt: new Date(),
    } as unknown as TopicTurn);
  }

  const previousTopics = interview.topics.filter(
    (t) => t.topicIndex < activeTopic.topicIndex && t.status === "CLOSED",
  );
  
  const streamable = createStreamableValue("");

  // Determine if this is an opening question or a follow-up
  const isOpening = activeTopic.turns.length === 0;  

  // Start the AI stream in the background
  (async () => {
    try {
      const planConfigSnapshot = interview.planConfigSnapshot as Record<
        string,
        unknown
      > | null;

      const candidateProfile = {
        targetRole: planConfigSnapshot?.targetRole || "Software Engineer",
        experienceLevel: "MID", // Fallback, would normally pull from jobProfile
        parsedData: interview.resumeSnapshot,
      };
      const plannedTopic = {
        plannedCategory: activeTopic.plannedCategory,
        targetSkills: activeTopic.targetSkills,
        plannedIntent: activeTopic.plannedIntent,
        plannedDifficulty: activeTopic.plannedDifficulty,
      };

      let aiResult;

      if (isOpening) {
        aiResult = await generateOpeningQuestion(
          candidateProfile,
          plannedTopic,
          previousTopics,
        );
      } else {
        const followUpCount = activeTopic.turns.filter(
          (t) => t.role === "AI" && t.turnType === "FOLLOWUP",
        ).length;
        const planConfigSnapshot = interview.planConfigSnapshot as Record<
          string,
          unknown
        > | null;
        const maxFollowUps =
          (planConfigSnapshot?.maxFollowUpsPerTopic as number) || 2;
        const maxFollowUpsReached = followUpCount >= maxFollowUps;

        aiResult = await generateFollowUp(
          candidateProfile,
          plannedTopic,
          previousTopics,
          activeTopic.turns,
          maxFollowUpsReached,
        );
      }

      let fullText = "";
      for await (const chunk of aiResult.textStream) {
        fullText += chunk;
        streamable.update(fullText);
      }

      // Infer intent based on whether maxFollowUpsReached or if the AI output contains transition phrasing
      let turnType: TurnType = isOpening ? "QUESTION" : "FOLLOWUP";
      let moveToNext = false;
      let closeReason = "AI_COMPLETED";

      if (!isOpening) {
        const followUpCount = activeTopic.turns.filter(
          (t) => t.role === "AI" && t.turnType === "FOLLOWUP",
        ).length;
        const planConfigSnapshot = interview.planConfigSnapshot as Record<
          string,
          unknown
        > | null;
        const maxFollowUps =
          (planConfigSnapshot?.maxFollowUpsPerTopic as number) || 2;

        if (followUpCount >= maxFollowUps) {
          turnType = "TOPIC_CLOSURE";
          moveToNext = true;
          closeReason = "MAX_FOLLOWUPS_REACHED";
        } else if (fullText.includes("[NEXT_TOPIC]")) {
          turnType = "TOPIC_CLOSURE";
          moveToNext = true;
          closeReason = "AI_COMPLETED";
          fullText = fullText.replace("[NEXT_TOPIC]", "").trim();
        }
      }

      // Save the AI turn to the database
      const nextTurnIndex = activeTopic.turns.length;
      await prisma.topicTurn.create({
        data: {
          topicId: activeTopic.id,
          interviewId,
          turnIndex: nextTurnIndex,
          role: "AI",
          turnType,
          content: fullText,
          moveToNext,
        },
      });

      // If the AI decided to close the topic
      if (moveToNext) {
        await prisma.interviewTopic.update({
          where: { id: activeTopic.id },
          data: {
            status: "CLOSED",
            closedAt: new Date(),
            closeReason: closeReason as TopicCloseReason,
            judgePending: true,
          },
        });

        // Find next topic and activate it
        const nextTopic = interview.topics.find(
          (t) => t.topicIndex === activeTopic.topicIndex + 1,
        );


        if (nextTopic) {

          // Wait 5 seconds before activating the next topic so the candidate has time to read the AI's final response
          await new Promise(resolve => setTimeout(resolve, 5000))

          
          await prisma.interviewTopic.update({
            where: { id: nextTopic.id },
            data: {
              status: "ACTIVE",
              startedAt: new Date(),
            },
          });

          await prisma.interview.update({
            where: { id: interviewId },
            data: { currentTopicIndex: nextTopic.topicIndex },
          });
        } else {
          // Interview completed
          await prisma.interview.update({
            where: { id: interviewId },
            data: {
              status: "COMPLETED",
              completedAt: new Date(),
            },
          });
        }

        // TODO: Enqueue Judge worker for the closed topic
        await judgeQueue.add("judge-topic", {
          interviewId,
          topicId: activeTopic.id,
        });
      }

      console.log(
        `✅ [streamAiTurnAction] AI turn completed for interview ${interviewId}, topic ${activeTopic.id}`,
      );

      // TODO:
      // Make topic close + judge queue enqueue atomic.
      // If queue add fails after topic closes,
      // judgePending may remain true forever.

      streamable.done();
    } catch (err: unknown) {
      console.error(
        "🔥 [streamAiTurnAction stream error] FATAL ERROR IN BACKGROUND AI STREAM:",
        err,
      );
      if (err instanceof Error) {
        streamable.error(err.message);
      } else {
        streamable.error("Unknown streaming error");
      }
    }
  })();

  return { stream: streamable.value };
}
