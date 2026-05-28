/*
  Warnings:

  - You are about to drop the column `configId` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `configSnapshot` on the `Interview` table. All the data in the column will be lost.
  - You are about to drop the column `planName` on the `Payment` table. All the data in the column will be lost.
  - You are about to drop the column `configName` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `endsAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `planName` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the column `startsAt` on the `Subscription` table. All the data in the column will be lost.
  - You are about to drop the `InterviewConfig` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `planConfigSnapshot` to the `Interview` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPeriodEnd` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `currentPeriodStart` to the `Subscription` table without a default value. This is not possible if the table is not empty.
  - Added the required column `planId` to the `Subscription` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- AlterTable
ALTER TABLE "Interview" DROP COLUMN "configId",
DROP COLUMN "configSnapshot",
ADD COLUMN     "planConfigId" TEXT,
ADD COLUMN     "planConfigSnapshot" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "InterviewQuestion" ADD COLUMN     "elapsedSeconds" INTEGER NOT NULL DEFAULT 0;

-- AlterTable
ALTER TABLE "InterviewTurn" ADD COLUMN     "timeUsedSeconds" INTEGER;

-- AlterTable
ALTER TABLE "Payment" DROP COLUMN "planName",
ADD COLUMN     "planId" TEXT;

-- AlterTable
ALTER TABLE "Subscription" DROP COLUMN "configName",
DROP COLUMN "endsAt",
DROP COLUMN "planName",
DROP COLUMN "startsAt",
ADD COLUMN     "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "currentPeriodStart" TIMESTAMP(3) NOT NULL,
ADD COLUMN     "planId" TEXT NOT NULL;

-- DropTable
DROP TABLE "InterviewConfig";

-- CreateTable
CREATE TABLE "PlanConfig" (
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

    CONSTRAINT "PlanConfig_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Plan" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "displayName" TEXT NOT NULL,
    "description" TEXT,
    "amountPaise" INTEGER,
    "billingInterval" "BillingInterval" NOT NULL DEFAULT 'ONE_TIME',
    "interviewCredits" INTEGER NOT NULL DEFAULT 1,
    "planConfigId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PlanConfig_name_key" ON "PlanConfig"("name");

-- CreateIndex
CREATE INDEX "PlanConfig_isDefault_idx" ON "PlanConfig"("isDefault");

-- CreateIndex
CREATE INDEX "PlanConfig_isActive_idx" ON "PlanConfig"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "Plan_name_key" ON "Plan"("name");

-- CreateIndex
CREATE INDEX "Plan_isActive_idx" ON "Plan"("isActive");

-- CreateIndex
CREATE INDEX "Plan_isVisible_idx" ON "Plan"("isVisible");

-- CreateIndex
CREATE INDEX "InterviewCredit_userId_expiresAt_idx" ON "InterviewCredit"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Payment_planId_idx" ON "Payment"("planId");

-- CreateIndex
CREATE INDEX "Subscription_providerSubId_idx" ON "Subscription"("providerSubId");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_planConfigId_fkey" FOREIGN KEY ("planConfigId") REFERENCES "PlanConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
