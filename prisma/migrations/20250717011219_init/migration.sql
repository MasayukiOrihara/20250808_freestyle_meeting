-- CreateTable
CREATE TABLE "HumanProfile" (
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

    CONSTRAINT "HumanProfile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
