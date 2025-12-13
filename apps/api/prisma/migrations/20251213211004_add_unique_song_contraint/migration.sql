/*
  Warnings:

  - A unique constraint covering the columns `[space_id,youtubeId,played_at]` on the table `songs` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "songs_space_id_youtubeId_played_at_key" ON "songs"("space_id", "youtubeId", "played_at");
