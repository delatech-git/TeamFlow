-- The init migration never added these, but the Prisma schema (and the app)
-- has always expected them. This backfills environments created from the
-- migration history alone (e.g. a fresh production database).

-- AlterTable
ALTER TABLE "PlanSummary" ADD COLUMN "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- AddForeignKey
ALTER TABLE "PlanSummary" ADD CONSTRAINT "PlanSummary_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
