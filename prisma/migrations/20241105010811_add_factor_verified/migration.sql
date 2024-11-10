/*
  Warnings:

  - Added the required column `isTwoFactorVerified` to the `User` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "User" ADD COLUMN     "isTwoFactorVerified" BOOLEAN NOT NULL;
