/*
  Warnings:

  - The values [RESUME_DEFENCE,COMMUNICATION,SYSTEM_DESIGN_MINI] on the enum `ActivityType` will be removed. If these variants are still used in the database, this will fail.
  - The values [CONFIDENCE_CHECK,DEPTH_PROBE,PRESSURE_TEST,CLARITY_CHECK,REASONING_EVAL,AUTHENTICITY_CHECK,REFLECTION_TRIGGER] on the enum `PsychologicalIntent` will be removed. If these variants are still used in the database, this will fail.
  - The values [FOLLOW_UP_DEPTH,PRESSURE,REFLECTION,COMMUNICATION_SIMPLIFICATION] on the enum `QuestionCategory` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "ActivityType_new" AS ENUM ('DEBUGGING', 'CODE_CORRECTION', 'OUTPUT_PREDICTION', 'PRIORITISATION');
ALTER TABLE "InterviewTopic" ALTER COLUMN "activityType" TYPE "ActivityType_new" USING ("activityType"::text::"ActivityType_new");
ALTER TYPE "ActivityType" RENAME TO "ActivityType_old";
ALTER TYPE "ActivityType_new" RENAME TO "ActivityType";
DROP TYPE "public"."ActivityType_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "PsychologicalIntent_new" AS ENUM ('EXPLORE', 'VALIDATE', 'CHALLENGE');
ALTER TABLE "InterviewTopic" ALTER COLUMN "plannedIntent" TYPE "PsychologicalIntent_new" USING ("plannedIntent"::text::"PsychologicalIntent_new");
ALTER TYPE "PsychologicalIntent" RENAME TO "PsychologicalIntent_old";
ALTER TYPE "PsychologicalIntent_new" RENAME TO "PsychologicalIntent";
DROP TYPE "public"."PsychologicalIntent_old";
COMMIT;

-- AlterEnum
BEGIN;
CREATE TYPE "QuestionCategory_new" AS ENUM ('HR', 'RESUME_BASED', 'CONCEPTUAL', 'SCENARIO', 'BEHAVIORAL', 'SYSTEM_DESIGN', 'ACTIVITY');
ALTER TABLE "InterviewTopic" ALTER COLUMN "plannedCategory" TYPE "QuestionCategory_new" USING ("plannedCategory"::text::"QuestionCategory_new");
ALTER TYPE "QuestionCategory" RENAME TO "QuestionCategory_old";
ALTER TYPE "QuestionCategory_new" RENAME TO "QuestionCategory";
DROP TYPE "public"."QuestionCategory_old";
COMMIT;
