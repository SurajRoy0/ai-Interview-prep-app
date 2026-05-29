-- AlterTable
ALTER TABLE "PlanConfig" ADD COLUMN     "maxJobProfiles" INTEGER NOT NULL DEFAULT 1,
ADD COLUMN     "maxResumeUploadsPerDay" INTEGER NOT NULL DEFAULT 1;
