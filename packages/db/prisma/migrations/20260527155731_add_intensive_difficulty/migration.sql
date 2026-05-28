/*
  Warnings:

  - You are about to drop the column `relatedTurnIds` on the `ImprovementSuggestion` table. All the data in the column will be lost.
  - You are about to drop the column `ablyChannelId` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `currentTurnIndex` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `interviewFormat` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `abandonedAtTurn` on the `InterviewAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `avgTtsLatencyMs` on the `InterviewAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `interruptionCount` on the `InterviewAnalytics` table. All the data in the column will be lost.
  - You are about to drop the column `answer` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `audioKey` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `codeEditorContent` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `codeSnippetShown` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `followUpReason` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `hesitationDetected` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `inputMode` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `interruptedAiText` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `isFollowUp` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `psychologicalIntent` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `question` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `questionCategory` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `questionDifficulty` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `silenceDurationMs` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `speechDurationMs` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `targetSkills` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `topicScored` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `turnScore` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `wasInterruption` on the `InterviewTurn` table. All the data in the column will be lost.
  - You are about to drop the column `passwordHash` on the `User` table. All the data in the column will be lost.
  - You are about to drop the `InterviewActivity` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `configSnapshot` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `maxPauseCount` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `reportDepth` to the `InterviewReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `interviewQuestionId` to the `InterviewTurn` table without a default value. This is not possible if the table is not empty.
  - Added the required column `turnType` to the `InterviewTurn` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "DifficultyProgression" AS ENUM ('GRADUAL', 'ADAPTIVE', 'INTENSIVE');

-- CreateEnum
CREATE TYPE "QuestionGenMode" AS ENUM ('HYBRID');

-- CreateEnum
CREATE TYPE "ReportDepth" AS ENUM ('MINIMAL', 'STANDARD', 'DETAILED', 'EXHAUSTIVE');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('QA', 'ACTIVITY');

-- CreateEnum
CREATE TYPE "TopicStatus" AS ENUM ('PENDING', 'ACTIVE', 'CLOSED', 'SKIPPED');

-- CreateEnum
CREATE TYPE "TopicCloseReason" AS ENUM ('TIME_EXPIRED', 'MAX_FOLLOWUPS_REACHED', 'AI_ADVANCED', 'USER_ADVANCED', 'SAFETY_CAP', 'INTERVIEW_PAUSED', 'INTERVIEW_ENDED');

-- CreateEnum
CREATE TYPE "TurnType" AS ENUM ('QUESTION', 'FOLLOWUP', 'CLARIFICATION_RESPONSE', 'HINT', 'TOPIC_TRANSITION', 'ANSWER', 'FOLLOWUP_ANSWER', 'CLARIFICATION_REQUEST', 'HINT_REQUEST', 'CODE_SUBMISSION', 'SKIP_REQUEST');

-- CreateEnum
CREATE TYPE "PauseReason" AS ENUM ('USER_PAUSED', 'PLATFORM_FAILURE', 'BROWSER_CRASH');

-- AlterEnum
ALTER TYPE "InterviewStatus" ADD VALUE 'PAUSED';

-- DropForeignKey
ALTER TABLE "InterviewActivity" DROP CONSTRAINT "InterviewActivity_interviewId_fkey";

-- DropForeignKey
ALTER TABLE "InterviewTurn" DROP CONSTRAINT "InterviewTurn_interviewId_fkey";

-- AlterTable
ALTER TABLE "ImprovementSuggestion" DROP COLUMN "relatedTurnIds",
ADD COLUMN     "relatedQuestionIds" TEXT[];

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "ablyChannelId",
DROP COLUMN "currentTurnIndex",
DROP COLUMN "interviewFormat",
ADD COLUMN     "configId" TEXT,
ADD COLUMN     "configSnapshot" JSONB NOT NULL,
ADD COLUMN     "currentQuestionIndex" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "difficultyProgression" "DifficultyProgression" NOT NULL DEFAULT 'ADAPTIVE',
ADD COLUMN     "feedback" TEXT,
ADD COLUMN     "maxPauseCount" INTEGER NOT NULL,
ADD COLUMN     "pauseCount" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "pauseReason" "PauseReason",
ADD COLUMN     "pausedAt" TIMESTAMP(3),
ADD COLUMN     "resumeDeadline" TIMESTAMP(3),
ADD COLUMN     "resumeSnapshot" JSONB;

-- AlterTable
ALTER TABLE "InterviewAnalytics" DROP COLUMN "abandonedAtTurn",
DROP COLUMN "avgTtsLatencyMs",
DROP COLUMN "interruptionCount",
ADD COLUMN     "abandonedAtQuestion" INTEGER,
ADD COLUMN     "pauseCount" INTEGER;

-- AlterTable
ALTER TABLE "InterviewReport" ADD COLUMN     "questionBreakdown" JSONB,
ADD COLUMN     "reportDepth" "ReportDepth" NOT NULL;

-- AlterTable
ALTER TABLE "InterviewTurn" DROP COLUMN "answer",
DROP COLUMN "audioKey",
DROP COLUMN "codeEditorContent",
DROP COLUMN "codeSnippetShown",
DROP COLUMN "followUpReason",
DROP COLUMN "hesitationDetected",
DROP COLUMN "inputMode",
DROP COLUMN "interruptedAiText",
DROP COLUMN "isFollowUp",
DROP COLUMN "psychologicalIntent",
DROP COLUMN "question",
DROP COLUMN "questionCategory",
DROP COLUMN "questionDifficulty",
DROP COLUMN "silenceDurationMs",
DROP COLUMN "speechDurationMs",
DROP COLUMN "targetSkills",
DROP COLUMN "topicScored",
DROP COLUMN "turnScore",
DROP COLUMN "wasInterruption",
ADD COLUMN     "content" TEXT,
ADD COLUMN     "interviewQuestionId" TEXT NOT NULL,
ADD COLUMN     "moveToNext" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "streamingLatencyMs" INTEGER,
ADD COLUMN     "suggestedInputMode" "InputMode",
ADD COLUMN     "timeLimitSeconds" INTEGER,
ADD COLUMN     "turnType" "TurnType" NOT NULL;

-- AlterTable
ALTER TABLE "Resume" ADD COLUMN     "parseError" TEXT;

-- AlterTable
ALTER TABLE "Subscription" ADD COLUMN     "configName" TEXT;

-- AlterTable
ALTER TABLE "User" DROP COLUMN "passwordHash";

-- DropTable
DROP TABLE "InterviewActivity";

-- CreateTable
CREATE TABLE "InterviewConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "targetTurns" INTEGER NOT NULL DEFAULT 8,
    "maxFollowUpsPerTopic" INTEGER NOT NULL DEFAULT 2,
    "hardCapTurnsPerTopic" INTEGER NOT NULL DEFAULT 8,
    "activityConfig" JSONB NOT NULL DEFAULT '{}',
    "questionTimeSecs" INTEGER NOT NULL DEFAULT 120,
    "followUpTimeSecs" INTEGER NOT NULL DEFAULT 90,
    "clarificationTimeSecs" INTEGER NOT NULL DEFAULT 30,
    "activityTimeSecs" INTEGER NOT NULL DEFAULT 300,
    "maxPauseCount" INTEGER NOT NULL DEFAULT 2,
    "resumeDeadlineHours" INTEGER NOT NULL DEFAULT 24,
    "allowedDifficultyModes" "DifficultyProgression"[] DEFAULT ARRAY['GRADUAL', 'ADAPTIVE', 'INTENSIVE']::"DifficultyProgression"[],
    "parseFullResume" BOOLEAN NOT NULL DEFAULT false,
    "maxProjectsToExtract" INTEGER NOT NULL DEFAULT 3,
    "maxSkillsPerCategory" INTEGER NOT NULL DEFAULT 10,
    "maxExperienceYears" INTEGER NOT NULL DEFAULT 10,
    "reportDepth" "ReportDepth" NOT NULL DEFAULT 'STANDARD',
    "maxTopicsInReport" INTEGER NOT NULL DEFAULT 5,
    "maxSuggestionsCount" INTEGER NOT NULL DEFAULT 3,
    "includeActivityReport" BOOLEAN NOT NULL DEFAULT true,
    "includeTopicEvidence" BOOLEAN NOT NULL DEFAULT false,
    "includeAuthAnalysis" BOOLEAN NOT NULL DEFAULT false,
    "reportUnlockable" BOOLEAN NOT NULL DEFAULT false,
    "plannerModel" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "interviewModel" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "judgeModel" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "reportModel" TEXT NOT NULL DEFAULT 'gemini-2.5-flash',
    "questionGenMode" "QuestionGenMode" NOT NULL DEFAULT 'HYBRID',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewQuestion" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "questionIndex" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL,
    "plannedIntent" "PsychologicalIntent",
    "plannedCategory" "QuestionCategory",
    "targetSkills" TEXT[],
    "plannedDifficulty" "QuestionDifficulty",
    "questionText" TEXT,
    "activityType" "ActivityType",
    "codeSnippet" TEXT,
    "expectedAnswer" TEXT,
    "timeLimitSeconds" INTEGER NOT NULL,
    "remainingSeconds" INTEGER,
    "status" "TopicStatus" NOT NULL DEFAULT 'PENDING',
    "closeReason" "TopicCloseReason",
    "startedAt" TIMESTAMP(3),
    "closedAt" TIMESTAMP(3),
    "judgeSummary" TEXT,
    "judgeScore" INTEGER,
    "judgeStrengths" TEXT[],
    "judgeWeaknesses" TEXT[],
    "judgePending" BOOLEAN NOT NULL DEFAULT false,
    "judgeRetryCount" INTEGER NOT NULL DEFAULT 0,
    "judgedAt" TIMESTAMP(3),

    CONSTRAINT "InterviewQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "InterviewConfig_name_key" ON "InterviewConfig"("name");

-- CreateIndex
CREATE INDEX "InterviewConfig_isDefault_idx" ON "InterviewConfig"("isDefault");

-- CreateIndex
CREATE INDEX "InterviewConfig_isActive_idx" ON "InterviewConfig"("isActive");

-- CreateIndex
CREATE INDEX "InterviewQuestion_interviewId_idx" ON "InterviewQuestion"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewQuestion_interviewId_questionIndex_idx" ON "InterviewQuestion"("interviewId", "questionIndex");

-- CreateIndex
CREATE INDEX "InterviewQuestion_interviewId_status_idx" ON "InterviewQuestion"("interviewId", "status");

-- CreateIndex
CREATE INDEX "InterviewTurn_interviewQuestionId_idx" ON "InterviewTurn"("interviewQuestionId");

-- AddForeignKey
ALTER TABLE "InterviewQuestion" ADD CONSTRAINT "InterviewQuestion_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewTurn" ADD CONSTRAINT "InterviewTurn_interviewQuestionId_fkey" FOREIGN KEY ("interviewQuestionId") REFERENCES "InterviewQuestion"("id") ON DELETE CASCADE ON UPDATE CASCADE;
