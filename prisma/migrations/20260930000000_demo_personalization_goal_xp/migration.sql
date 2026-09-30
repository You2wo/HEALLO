-- AlterTable
ALTER TABLE "User" ADD COLUMN "isDemo" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN "personalization" TEXT;

-- AlterTable
ALTER TABLE "PetSettings" ADD COLUMN "goalXp" INTEGER NOT NULL DEFAULT 0;
