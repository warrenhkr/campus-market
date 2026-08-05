-- CreateEnum
CREATE TYPE "subscription_plan" AS ENUM ('DECOUVERTE', 'STARTER', 'BUSINESS', 'PRO');

-- AlterTable
ALTER TABLE "sellers" ADD COLUMN "subscription_plan" "subscription_plan" NOT NULL DEFAULT 'DECOUVERTE';
