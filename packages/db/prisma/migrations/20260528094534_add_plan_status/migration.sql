-- AlterTable
ALTER TABLE "Interview" ADD COLUMN     "planError" TEXT,
ADD COLUMN     "planStatus" "JobStatus" NOT NULL DEFAULT 'PENDING';
