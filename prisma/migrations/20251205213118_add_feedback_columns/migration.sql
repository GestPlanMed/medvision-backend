-- AlterTable
ALTER TABLE "appointments" ADD COLUMN     "feedbackDoctor" TEXT,
ADD COLUMN     "feedbackPatient" TEXT,
ALTER COLUMN "roomName" DROP NOT NULL;
