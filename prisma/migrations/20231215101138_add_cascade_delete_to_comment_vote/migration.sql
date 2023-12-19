-- DropForeignKey
ALTER TABLE "votes" DROP CONSTRAINT "votes_commentId_fkey";

-- AddForeignKey
ALTER TABLE "votes" ADD CONSTRAINT "votes_commentId_fkey" FOREIGN KEY ("commentId") REFERENCES "comments"("id") ON DELETE CASCADE ON UPDATE CASCADE;
