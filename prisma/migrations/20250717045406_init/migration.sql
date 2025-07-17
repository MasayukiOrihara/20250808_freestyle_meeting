/*
  Warnings:

  - You are about to drop the `fileHashGroup` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "fileHashGroup";

-- CreateTable
CREATE TABLE "FileHashGroup" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "hashes" TEXT[],

    CONSTRAINT "FileHashGroup_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "FileHashGroup_key_key" ON "FileHashGroup"("key");
