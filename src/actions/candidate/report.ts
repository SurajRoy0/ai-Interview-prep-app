"use server";

import { prisma } from "@repo/db";
import { getSession } from "@/lib/auth-server";
import { ActionResult, success, failure } from "@/lib/action-result";

export async function getInterviewSummaryAction(
  interviewId: string,
): Promise<ActionResult<{ interview: unknown }>> {
  try {
    const session = await getSession();
    if (!session) return failure("Unauthorized", "UNAUTHORIZED");

    const interview = await prisma.interview.findUnique({
      where: { id: interviewId, userId: session.user.id },
      include: {

        topics: {
          orderBy: { topicIndex: "asc" },
          include: { turns: { orderBy: { turnIndex: "asc" } } },
        },
      },
    });

    if (!interview) return failure("Interview not found", "NOT_FOUND");

    return success({ interview });
  } catch (error) {
    console.error("Failed to fetch interview summary", error);
    return failure("Failed to fetch interview summary", "INTERNAL_ERROR");
  }
}
