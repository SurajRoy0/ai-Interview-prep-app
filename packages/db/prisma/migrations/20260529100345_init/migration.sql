-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('CANDIDATE', 'ADMIN');

-- CreateEnum
CREATE TYPE "Ecosystem" AS ENUM ('JAVASCRIPT', 'PYTHON', 'JAVA', 'GO', 'OTHER');

-- CreateEnum
CREATE TYPE "ExperienceLevel" AS ENUM ('FRESHER', 'JUNIOR', 'MID', 'SENIOR');

-- CreateEnum
CREATE TYPE "InterviewStatus" AS ENUM ('PENDING', 'ACTIVE', 'PAUSED', 'COMPLETED', 'FAILED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "InterviewType" AS ENUM ('MOCK', 'TECHNICAL', 'HR', 'SYSTEM_DESIGN', 'BEHAVIORAL', 'FULL');

-- CreateEnum
CREATE TYPE "InterviewMode" AS ENUM ('TEXT', 'VOICE', 'MIXED');

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
CREATE TYPE "TopicCloseReason" AS ENUM ('TOPIC_TIME_LIMIT_REACHED', 'MAX_FOLLOWUPS_REACHED', 'MAX_CLARIFICATION_REACHED', 'AI_COMPLETED', 'USER_SKIPPED', 'INTERVIEW_PAUSED', 'INTERVIEW_ENDED');

-- CreateEnum
CREATE TYPE "TurnRole" AS ENUM ('AI', 'USER');

-- CreateEnum
CREATE TYPE "TurnType" AS ENUM ('QUESTION', 'FOLLOWUP', 'CLARIFICATION_RESPONSE', 'HINT', 'TOPIC_CLOSURE', 'ANSWER', 'FOLLOWUP_ANSWER', 'CLARIFICATION_REQUEST', 'HINT_REQUEST', 'CODE_SUBMISSION', 'SKIP_REQUEST');

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
CREATE TYPE "PauseReason" AS ENUM ('USER_PAUSED', 'PLATFORM_FAILURE', 'BROWSER_CRASH');

-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'SUCCESS', 'FAILED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "SubscriptionStatus" AS ENUM ('ACTIVE', 'CANCELLED', 'EXPIRED', 'PAST_DUE');

-- CreateEnum
CREATE TYPE "BillingInterval" AS ENUM ('ONE_TIME', 'MONTHLY', 'QUARTERLY', 'YEARLY');

-- CreateEnum
CREATE TYPE "JobStatus" AS ENUM ('PENDING', 'PROCESSING', 'DONE', 'FAILED');

-- CreateEnum
CREATE TYPE "VisibilityStatus" AS ENUM ('PRIVATE', 'PUBLIC', 'RECRUITER_VISIBLE');

-- CreateTable
CREATE TABLE "PlanConfig" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "isDefault" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "targetTopics" INTEGER NOT NULL DEFAULT 8,
    "maxFollowUpsPerTopic" INTEGER NOT NULL DEFAULT 2,
    "maxClarificationsPerTopic" INTEGER NOT NULL DEFAULT 2,
    "activityConfig" JSONB NOT NULL DEFAULT '{}',
    "defaultTopicTimeLimitSecs" INTEGER NOT NULL DEFAULT 600,
    "maxPauseCount" INTEGER NOT NULL DEFAULT 2,
    "resumeDeadlineHours" INTEGER NOT NULL DEFAULT 24,
    "allowedDifficultyModes" "DifficultyProgression"[] DEFAULT ARRAY['GRADUAL', 'ADAPTIVE', 'INTENSIVE']::"DifficultyProgression"[],
    "maxResumeUploadsPerJobProfile" INTEGER NOT NULL DEFAULT 1,
    "parseFullResume" BOOLEAN NOT NULL DEFAULT false,
    "maxProjectsToExtract" INTEGER NOT NULL DEFAULT 3,
    "maxSkillsPerCategory" INTEGER NOT NULL DEFAULT 10,
    "maxExperienceYears" INTEGER NOT NULL DEFAULT 10,
    "reportDepth" "ReportDepth" NOT NULL DEFAULT 'STANDARD',
    "reportUnlockable" BOOLEAN NOT NULL DEFAULT false,
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
    "includedCredits" INTEGER NOT NULL DEFAULT 1,
    "planConfigId" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isVisible" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Plan_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "image" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'CANDIDATE',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "emailVerified" BOOLEAN NOT NULL DEFAULT false,
    "joiningBonusGranted" BOOLEAN NOT NULL DEFAULT false,
    "visibilityStatus" "VisibilityStatus" NOT NULL DEFAULT 'PRIVATE',
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
    "parseError" TEXT,
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
    "resumeSnapshot" JSONB,
    "type" "InterviewType" NOT NULL DEFAULT 'FULL',
    "mode" "InterviewMode" NOT NULL DEFAULT 'MIXED',
    "status" "InterviewStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT,
    "planConfigSnapshot" JSONB NOT NULL,
    "planConfigId" TEXT,
    "difficultyProgression" "DifficultyProgression" NOT NULL DEFAULT 'ADAPTIVE',
    "interviewPlan" JSONB,
    "planGenerated" BOOLEAN NOT NULL DEFAULT false,
    "planStatus" "JobStatus" NOT NULL DEFAULT 'PENDING',
    "planError" TEXT,
    "totalTopics" INTEGER NOT NULL DEFAULT 8,
    "currentTopicIndex" INTEGER NOT NULL DEFAULT 0,
    "activitiesCompleted" INTEGER NOT NULL DEFAULT 0,
    "activitiesPlanned" INTEGER NOT NULL DEFAULT 0,
    "pauseCount" INTEGER NOT NULL DEFAULT 0,
    "maxPauseCount" INTEGER NOT NULL,
    "pausedAt" TIMESTAMP(3),
    "pauseReason" "PauseReason",
    "resumeDeadline" TIMESTAMP(3),
    "overallScore" INTEGER,
    "communicationScore" INTEGER,
    "technicalScore" INTEGER,
    "confidenceScore" INTEGER,
    "authenticityScore" INTEGER,
    "feedback" TEXT,
    "weakTopics" TEXT[],
    "strongTopics" TEXT[],
    "durationSeconds" INTEGER,
    "startedAt" TIMESTAMP(3),
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Interview_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InterviewTopic" (
    "id" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "topicIndex" INTEGER NOT NULL,
    "type" "QuestionType" NOT NULL,
    "plannedIntent" "PsychologicalIntent",
    "plannedCategory" "QuestionCategory",
    "targetSkills" TEXT[],
    "plannedDifficulty" "QuestionDifficulty",
    "questionText" TEXT,
    "activityType" "ActivityType",
    "codeSnippet" TEXT,
    "expectedAnswer" TEXT,
    "timeLimitSeconds" INTEGER,
    "remainingSeconds" INTEGER,
    "timeUsedSeconds" INTEGER,
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

    CONSTRAINT "InterviewTopic_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "TopicTurn" (
    "id" TEXT NOT NULL,
    "topicId" TEXT NOT NULL,
    "interviewId" TEXT NOT NULL,
    "turnIndex" INTEGER NOT NULL,
    "role" "TurnRole" NOT NULL,
    "turnType" "TurnType" NOT NULL,
    "content" TEXT,
    "moveToNext" BOOLEAN NOT NULL DEFAULT false,
    "suggestedInputMode" "InputMode",
    "latencyMs" INTEGER,
    "streamingLatencyMs" INTEGER,
    "timeUsedSeconds" INTEGER,
    "tokenUsage" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "TopicTurn_pkey" PRIMARY KEY ("id")
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
    "questionBreakdown" JSONB,
    "reportDepth" "ReportDepth" NOT NULL,
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
    "relatedTopicIds" TEXT[],
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
    "totalSpeakingSeconds" INTEGER,
    "totalSilenceSeconds" INTEGER,
    "hesitationCount" INTEGER,
    "avgAnswerDurationMs" INTEGER,
    "abandonedAtTopic" INTEGER,
    "completionRate" DOUBLE PRECISION,
    "activitiesCompleted" INTEGER,
    "pauseCount" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "InterviewAnalytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Credit" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL DEFAULT 0,
    "reason" TEXT,
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Credit_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Payment" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "planId" TEXT,
    "amountPaise" INTEGER NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'INR',
    "provider" TEXT NOT NULL DEFAULT 'razorpay',
    "providerOrderId" TEXT,
    "providerPaymentId" TEXT,
    "providerSignature" TEXT,
    "status" "PaymentStatus" NOT NULL,
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
    "planId" TEXT NOT NULL,
    "status" "SubscriptionStatus" NOT NULL,
    "currentPeriodStart" TIMESTAMP(3) NOT NULL,
    "currentPeriodEnd" TIMESTAMP(3) NOT NULL,
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
CREATE INDEX "InterviewTopic_interviewId_idx" ON "InterviewTopic"("interviewId");

-- CreateIndex
CREATE INDEX "InterviewTopic_interviewId_status_idx" ON "InterviewTopic"("interviewId", "status");

-- CreateIndex
CREATE UNIQUE INDEX "InterviewTopic_interviewId_topicIndex_key" ON "InterviewTopic"("interviewId", "topicIndex");

-- CreateIndex
CREATE INDEX "TopicTurn_topicId_idx" ON "TopicTurn"("topicId");

-- CreateIndex
CREATE INDEX "TopicTurn_interviewId_idx" ON "TopicTurn"("interviewId");

-- CreateIndex
CREATE INDEX "TopicTurn_interviewId_turnIndex_idx" ON "TopicTurn"("interviewId", "turnIndex");

-- CreateIndex
CREATE UNIQUE INDEX "TopicTurn_topicId_turnIndex_key" ON "TopicTurn"("topicId", "turnIndex");

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
CREATE INDEX "Credit_userId_idx" ON "Credit"("userId");

-- CreateIndex
CREATE INDEX "Credit_userId_expiresAt_idx" ON "Credit"("userId", "expiresAt");

-- CreateIndex
CREATE INDEX "Payment_userId_idx" ON "Payment"("userId");

-- CreateIndex
CREATE INDEX "Payment_status_idx" ON "Payment"("status");

-- CreateIndex
CREATE INDEX "Payment_providerPaymentId_idx" ON "Payment"("providerPaymentId");

-- CreateIndex
CREATE INDEX "Payment_planId_idx" ON "Payment"("planId");

-- CreateIndex
CREATE INDEX "Subscription_userId_idx" ON "Subscription"("userId");

-- CreateIndex
CREATE INDEX "Subscription_userId_status_idx" ON "Subscription"("userId", "status");

-- CreateIndex
CREATE INDEX "Subscription_providerSubId_idx" ON "Subscription"("providerSubId");

-- CreateIndex
CREATE INDEX "AuditLog_userId_idx" ON "AuditLog"("userId");

-- CreateIndex
CREATE INDEX "AuditLog_action_idx" ON "AuditLog"("action");

-- CreateIndex
CREATE INDEX "AuditLog_createdAt_idx" ON "AuditLog"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "FeatureFlag_key_key" ON "FeatureFlag"("key");

-- AddForeignKey
ALTER TABLE "Plan" ADD CONSTRAINT "Plan_planConfigId_fkey" FOREIGN KEY ("planConfigId") REFERENCES "PlanConfig"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

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
ALTER TABLE "InterviewTopic" ADD CONSTRAINT "InterviewTopic_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "TopicTurn" ADD CONSTRAINT "TopicTurn_topicId_fkey" FOREIGN KEY ("topicId") REFERENCES "InterviewTopic"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewReport" ADD CONSTRAINT "InterviewReport_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ImprovementSuggestion" ADD CONSTRAINT "ImprovementSuggestion_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InterviewAnalytics" ADD CONSTRAINT "InterviewAnalytics_interviewId_fkey" FOREIGN KEY ("interviewId") REFERENCES "Interview"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Credit" ADD CONSTRAINT "Credit_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Payment" ADD CONSTRAINT "Payment_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Subscription" ADD CONSTRAINT "Subscription_planId_fkey" FOREIGN KEY ("planId") REFERENCES "Plan"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
