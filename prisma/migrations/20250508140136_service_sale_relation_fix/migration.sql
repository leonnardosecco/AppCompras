/*
  Warnings:

  - You are about to drop the `ServiceInstallment` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `VerificationToken` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "ServiceInstallment" DROP CONSTRAINT "ServiceInstallment_serviceSaleId_fkey";

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- DropTable
DROP TABLE "ServiceInstallment";

-- DropTable
DROP TABLE "VerificationToken";
