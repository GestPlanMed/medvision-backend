-- AlterTable
ALTER TABLE "doctors" ADD COLUMN     "monthlySlots" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "weeklyAvailability" JSONB;
