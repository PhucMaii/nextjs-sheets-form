/*
  Warnings:

  - You are about to alter the column `last_opened` on the `Form` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.

*/
-- AlterTable
ALTER TABLE `Form` MODIFY `last_opened` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP(3);
