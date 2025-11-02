/*
  Warnings:

  - You are about to drop the column `status` on the `Chat` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[id,chatId]` on the table `Message` will be added. If there are existing duplicate values, this will fail.

*/
-- DropForeignKey
ALTER TABLE "public"."Message" DROP CONSTRAINT "Message_parentId_fkey";

-- AlterTable
ALTER TABLE "Chat" DROP COLUMN "status";

-- AlterTable
ALTER TABLE "Message" ADD COLUMN     "status" TEXT;

-- CreateIndex
CREATE INDEX "Message_chatId_idx" ON "Message"("chatId");

-- CreateIndex
CREATE INDEX "Message_parentId_chatId_idx" ON "Message"("parentId", "chatId");

-- CreateIndex
CREATE UNIQUE INDEX "Message_id_chatId_key" ON "Message"("id", "chatId");

-- AddForeignKey
ALTER TABLE "Message" ADD CONSTRAINT "Message_parentId_chatId_fkey" FOREIGN KEY ("parentId", "chatId") REFERENCES "Message"("id", "chatId") ON DELETE CASCADE ON UPDATE CASCADE;
