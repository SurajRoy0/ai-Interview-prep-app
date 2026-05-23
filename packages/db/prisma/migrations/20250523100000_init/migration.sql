-- CreateSchema
CREATE SCHEMA IF NOT EXISTS "public";

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'ADMIN');

-- CreateEnum
CREATE TYPE "Ecosystem" AS ENUM ('JAVASCRIPT', 'PYTHON', 'JAVA', 'GO', 'OTHER');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('FRESHER', 'JUNIOR', 'MID', 'SENIOR');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('MOCK', 'TECHNICAL', 'HR', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'FULL');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('TEXT', 'VOICE', 'MIXED');

-- CreateEnum
CREATE TYPE "TurnRole" AS ENUM ('AI', 'USER');

-- CreateEnum
CREATE TYPE "ActivityType" AS ENUM ('DEBUGGING', 'CODE_CORRECTION', 'OUTPUT_PREDICTION', 'RESUME_DEFENCE', 'PRIORITISATION', 'COMMUNICATION', 'SYSTEM_DESIGN_MINI');

-- CreateEnum
CREATE TYPE "InputMode" AS ENUM ('VOICE', 'TEXT', 'CODE_EDITOR', 'VOICE_AND_CODE', 'VOICE_AND_TEXT');

-- CreateEnum
CREATE TYPE "QuestionCategory" AS ENUM ('HR', 'RESUME_BASED', 'FOLLOW_UP_DEPTH', 'CONCEPTUAL', 'SCENARIO', 'BEHAVIORAL', 'PRESSURE', 'REFLECTION', 'COMMUNICATION_SIMPLIFICATION', 'ACTIVITY');

-- CreateEnum
CREATE TYPE "QuestionDifficulty" AS ENUM ('EASY', 'MEDIUM', 'HARD');

-- CreateEnum
CREATE TYPE "PsychologicalIntent" AS ENUM ('CONFIDENCE_CHECK', 'DEPTH_PROBE', 'PRESSURE_TEST', 'CLARITY_CHECK', 'REASONING_EVAL', 'AUTHENTICITY_CHECK', 'REFLECTION_TRIGGER');

-- CreateEnum
CREATE TYPE "ImprovementPriority" AS ENUM ('CRITICAL', 'HIGH', 'MEDIUM', 'LOW');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "VisibilityStatus" AS ENUM ('PRIVATE', 'PUBLIC', 'RECRUITER_VISIBLE');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "passwordHash" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "visibilityStatus" "VisibilityStatus" NOT NULL DEFAULT 'PRIVATE',
    "freeInterviewUsed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuthSession" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "ipAddress" TEXT,
    "userAgent" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AuthSession_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Account" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accountId" TEXT NOT NULL,
    "providerId" TEXT NOT NULL,
    "accessToken" TEXT,
    "refreshToken" TEXT,
    "accessTokenExpiresAt" TIMESTAMP(3),
    "refreshTokenExpiresAt" TIMESTAMP(3),
    "scope" TEXT,
    "idToken" TEXT,
    "password" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Account_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Verification" (
    "id" TEXT NOT NULL,
    "identifier" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Verification_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "JobProfile" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "targetRole" TEXT NOT NULL,
    "description" TEXT,
    "experienceLevel" "ExperienceLevel" NOT NULL,
    "ecosystem" "Ecosystem",
    "activeResumeId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "JobProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Resume" (
    "id" TEXT NOT NULL,
    "jobProfileId" TEXT NOT NULL,
    "fileKey" TEXT,
    "fileUrl" TEXT,
    "fileName" TEXT,
    "version" INTEGER NOT NULL DEFAULT 1,
    "parseStatus" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "rawText" TEXT NOT NULL,
    "rawTextLength" INTEGER,
    "parsedData" JSONB NOT NULL,
    "ecosystem" "Ecosystem",
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Resume_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Interview" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "jobProfileId" TEXT NOT NULL,
    "resumeId" TEXT NOT NULL,
    "type" "InterviewType" NOT NULL DEFAULT 'FULL',
    "mode" "InterviewMode" NOT NULL DEFAULT 'MIXED',
    "interviewFormat" TEXT NOT NULL DEFAULT 'full',
    "status" "InterviewStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT,
    "interviewPlan" JSONB,
    "planGenerated" BOOLEAN NOT NULL DEFAULT false,
    "totalQuestions" INTEGER NOT NULL DEFAULT 8,
    "currentTurnIndex" INTEGER NOT NULL DEFAULT 0,
    "activitiesCompleted" INTEGER NOT NULL DEFAULT 0,
    "activitiesPlanned" INTEGER NOT NULL DEFAULT 0,
    "overallScore" INTEGER,
    "communicationScore" INTEGER,
    "technicalScore" INTEGER,
    "confidenceScore" INTEGER,
    "authenticityScore" INTEGER,
    "weakTopics" TEXT[],
    "strongTopics" TEXT[],
    "ablyChannelId" TEXT,
    "durationSeconds" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewTurn" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "turnIndex" INTEGER NOT NULL,
    "role" "TurnRole" NOT NULL,
    "questionCategory" "QuestionCategory",
    "questionDifficulty" "QuestionDifficulty",
    "psychologicalIntent" "PsychologicalIntent",
    "targetSkills" TEXT[],
    "question" TEXT,
    "answer" TEXT,
    "inputMode" "InputMode",
    "codeSnippetShown" TEXT,
    "codeEditorContent" TEXT,
    "audioKey" TEXT,
    "silenceDurationMs" INTEGER,
    "hesitationDetected" BOOLEAN NOT NULL DEFAULT false,
    "speechDurationMs" INTEGER,
    "isFollowUp" BOOLEAN NOT NULL DEFAULT false,
    "followUpReason" TEXT,
    "turnScore" INTEGER,
    "topicScored" TEXT,
    "wasInterruption" BOOLEAN NOT NULL DEFAULT false,
    "interruptedAiText" TEXT,
    "tokenUsage" INTEGER,
    "latencyMs" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewTurn_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewActivity" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "activityIndex" INTEGER NOT NULL,
    "type" "ActivityType" NOT NULL,
    "title" TEXT,
    "prompt" TEXT NOT NULL,
    "codeSnippet" TEXT,
    "expectedAnswer" TEXT,
    "candidateVoiceAnswer" TEXT,
    "candidateCodeAnswer" TEXT,
    "candidateTextAnswer" TEXT,
    "score" INTEGER,
    "evaluation" JSONB,
    "skillsEvaluated" TEXT[],
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "skipped" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "InterviewActivity_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewReport" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "overallScore" INTEGER NOT NULL,
    "communicationScore" INTEGER NOT NULL,
    "technicalScore" INTEGER NOT NULL,
    "confidenceScore" INTEGER NOT NULL,
    "authenticityScore" INTEGER,
    "performanceSummary" TEXT NOT NULL,
    "readinessLevel" TEXT NOT NULL,
    "readinessSummary" TEXT NOT NULL,
    "topStrengths" TEXT[],
    "weakTopics" JSONB NOT NULL,
    "topicAnalysis" JSONB NOT NULL,
    "activitySummary" JSONB,
    "communicationAnalysis" JSONB NOT NULL,
    "confidenceAnalysis" JSONB NOT NULL,
    "authenticityAnalysis" JSONB,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewReport_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ImprovementSuggestion" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "topic" TEXT NOT NULL,
    "priority" "ImprovementPriority" NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "learningPrompt" TEXT,
    "externalUrl" TEXT,
    "relatedTurnIds" TEXT[],
    "dismissed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ImprovementSuggestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewAnalytics" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "totalTokens" INTEGER,
    "totalCostPaise" INTEGER,
    "avgLatencyMs" INTEGER,
    "avgAiLatencyMs" INTEGER,
    "avgSttLatencyMs" INTEGER,
    "avgTtsLatencyMs" INTEGER,
    "totalSpeakingSeconds" INTEGER,
    "totalSilenceSeconds" INTEGER,
    "interruptionCount" INTEGER,
    "hesitationCount" INTEGER,
    "avgAnswerDurationMs" INTEGER,
    "abandonedAtTurn" INTEGER,
    "completionRate" DOUBLE PRECISION,
    "activitiesCompleted" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewCredit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "credits" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewCredit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amountPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "providerSignature" TEXT,
    "status" "PaymentStatus" NOT NULL,
    "planName" TEXT,
    "creditsGranted" INTEGER,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Payment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Subscription" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planName" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "interviewsLeft" INTEGER NOT NULL DEFAULT 0,
    "startsAt" TIMESTAMP(3) NOT NULL,
    "endsAt" TIMESTAMP(3) NOT NULL,
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "providerSubId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Subscription_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "entity" TEXT,
    "entityId" TEXT,
    "metadata" JSONB,
    "ipAddress" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FeatureFlag" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "enabled" BOOLEAN NOT NULL DEFAULT false,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "FeatureFlag_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_role_idx" ON "User"("role");

-- CreateIndex
CREATE UNIQUE INDEX "AuthSession_token_key" ON "AuthSession"("token");

-- CreateIndex
CREATE INDEX "AuthSession_userId_idx" ON "AuthSession"("userId");

-- CreateIndex
CREATE INDEX "AuthSession_token_idx" ON "AuthSession"("token");

-- CreateIndex
CREATE INDEX "Account_userId_idx" ON "Account"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Account_providerId_accountId_key" ON "Account"("providerId", "accountId");

-- CreateIndex
CREATE INDEX "Verification_identifier_idx" ON "Verification"("identifier");

-- CreateIndex
CREATE UNIQUE INDEX "JobProfile_activeResumeId_key" ON "JobProfile"("activeResumeId");

-- CreateIndex
CREATE INDEX "JobProfile_userId_idx" ON "JobProfile"("userId");

-- CreateIndex
CREATE INDEX "JobProfile_userId_isActive_idx" ON "JobProfile"("userId", "isActive");

-- CreateIndex
CREATE INDEX "JobProfile_targetRole_idx" ON "JobProfile"("targetRole");

-- CreateIndex
CREATE INDEX "Resume_jobProfileId_idx" ON "Resume"("jobProfileId");

-- CreateIndex
CREATE INDEX "Resume_jobProfileId_version_idx" ON "Resume"("jobProfileId", "version");

-- CreateIndex
CREATE INDEX "Resume_parseStatus_idx" ON "Resume"("parseStatus");

-- CreateIndex
CREATE INDEX "Interview_userId_idx" ON "Interview"("userId");

-- CreateIndex
CREATE INDEX "Interview_status_idx" ON "Interview"("status");

-- CreateIndex
CREATE INDEX "Interview_jobProfileId_idx" ON "Interview"("jobProfileId");

-- CreateIndex
CREATE INDEX "Interview_resumeId_idx" ON "Interview"("resumeId");

-- CreateIndex
CREATE INDEX "Interview_userId_status_idx" ON "Interview"("userId", "status");

-- CreateIndex
CREATE INDEX "Interview_createdAt_idx" ON "Interview"("createdAt");

-- CreateIndex
CREATE INDEX "InterviewTurn_interviewId_idx" ON "InterviewTurn"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewTurn_interviewId_turnIndex_idx" ON "InterviewTurn"("interviewId", "turnIndex");

-- CreateIndex
CREATE INDEX "InterviewActivity_interviewId_idx" ON "InterviewActivity"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewActivity_interviewId_activityIndex_idx" ON "InterviewActivity"("interviewId", "activityIndex");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewReport_interviewId_key" ON "InterviewReport"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewReport_userId_idx" ON "InterviewReport"("userId");

-- CreateIndex
CREATE INDEX "InterviewReport_interviewId_idx" ON "InterviewReport"("interviewId");

-- CreateIndex
CREATE INDEX "ImprovementSuggestion_interviewId_idx" ON "ImprovementSuggestion"("interviewId");

-- CreateIndex
CREATE INDEX "ImprovementSuggestion_userId_idx" ON "ImprovementSuggestion"("userId");

-- CreateIndex
CREATE INDEX "ImprovementSuggestion_topic_idx" ON "ImprovementSuggestion"("topic");

-- CreateIndex
CREATE INDEX "ImprovementSuggestion_priority_idx" ON "ImprovementSuggestion"("priority");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewAnalytics_interviewId_key" ON "InterviewAnalytics"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewCredit_userId_idx" ON "InterviewCredit"("userId");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_providerPaymentId_idx" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_status_idx" ON "Subscription"("status");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- AddForeignKey
ALTER TABLE "AuthSession" ADD CONSTRAINT "AuthSession_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Account" ADD CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobProfile" ADD CONSTRAINT "JobProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "JobProfile" ADD CONSTRAINT "JobProfile_activeResumeId_fkey" FOREIGN KEY ("activeResumeId") REFERENCES "Resume"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Resume" ADD CONSTRAINT "Resume_jobProfileId_fkey" FOREIGN KEY ("jobProfileId") REFERENCES "JobProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_jobProfileId_fkey" FOREIGN KEY ("jobProfileId") REFERENCES "JobProfile"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Interview" ADD CONSTRAINT "Interview_resumeId_fkey" FOREIGN KEY ("resumeId") REFERENCES "Resume"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewTurn" ADD CONSTRAINT "InterviewTurn_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewActivity" ADD CONSTRAINT "InterviewActivity_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewReport" ADD CONSTRAINT "InterviewReport_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovementSuggestion" ADD CONSTRAINT "ImprovementSuggestion_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAnalytics" ADD CONSTRAINT "InterviewAnalytics_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewCredit" ADD CONSTRAINT "InterviewCredit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
