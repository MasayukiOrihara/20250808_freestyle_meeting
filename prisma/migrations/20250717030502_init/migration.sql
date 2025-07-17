/*
  Warnings:

  - You are about to drop the `HumanProfile` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropTable
DROP TABLE "HumanProfile";

-- DropTable
DROP TABLE "User";

-- CreateTable
CREATE TABLE "HumanProfileDb" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "age" TEXT NOT NULL,
    "sex" TEXT NOT NULL,
    "occupation" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "interests" TEXT[],
    "personalityTraits" TEXT NOT NULL,
    "motivation" TEXT NOT NULL,
    "communicationPreference" TEXT NOT NULL,
    "prohibitedExpressions" TEXT NOT NULL,
    "lifestyle" TEXT NOT NULL,
    "weeklyRoutine" TEXT NOT NULL,
    "hobbies" TEXT[],
    "dislikes" TEXT[],
    "sessionId" TEXT NOT NULL,

    CONSTRAINT "HumanProfileDb_pkey" PRIMARY KEY ("id")
);
