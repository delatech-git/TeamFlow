-- AlterTable
ALTER TABLE "Reaction" ADD COLUMN "commentId" TEXT,
ALTER COLUMN "stickerId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "Reaction" ADD CONSTRAINT "Reaction_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "Comment"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- CreateIndex
CREATE UNIQUE INDEX "Reaction_commentId_userId_key" ON "Reaction"("commentId", "userId");
