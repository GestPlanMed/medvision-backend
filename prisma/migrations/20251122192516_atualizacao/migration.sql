/*
  Warnings:

  - Added the required column `linkCall` to the `appointments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "linkCall" TEXT NOT NULL,
ADD COLUMN     "notes" TEXT;
