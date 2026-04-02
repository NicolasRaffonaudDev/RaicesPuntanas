-- CreateEnum
CREATE TYPE "InquiryStatus" AS ENUM ('pending', 'read');

-- AlterTable
ALTER TABLE "Inquiry" ADD COLUMN     "status" "InquiryStatus" NOT NULL DEFAULT 'pending';
