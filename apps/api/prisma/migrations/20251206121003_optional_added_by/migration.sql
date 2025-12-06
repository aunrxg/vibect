-- DropForeignKey
ALTER TABLE "public"."songs" DROP CONSTRAINT "songs_added_by_id_fkey";

-- AlterTable
ALTER TABLE "songs" ADD COLUMN     "added_by_anonymous" TEXT,
ALTER COLUMN "added_by_id" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "songs" ADD CONSTRAINT "songs_added_by_id_fkey" FOREIGN KEY ("added_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
