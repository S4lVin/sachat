-- AlterTable
ALTER TABLE "User" ADD COLUMN     "apiKey" TEXT,
ADD COLUMN     "role" TEXT NOT NULL DEFAULT 'user';
