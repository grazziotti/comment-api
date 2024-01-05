-- AlterTable
ALTER TABLE "comments" ADD COLUMN     "replyToUserId" TEXT;

-- AddForeignKey
ALTER TABLE "comments" ADD CONSTRAINT "comments_replyToUserId_fkey" FOREIGN KEY ("replyToUserId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
