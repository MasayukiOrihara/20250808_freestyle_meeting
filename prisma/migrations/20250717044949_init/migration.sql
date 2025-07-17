-- CreateTable
CREATE TABLE "fileHashGroup" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "hashes" TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fileHashGroup_pkey" PRIMARY KEY ("id")
);
