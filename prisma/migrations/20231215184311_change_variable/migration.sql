/*
  Warnings:

  - You are about to drop the column `user_id` on the `Form` table. All the data in the column will be lost.
  - You are about to alter the column `last_opened` on the `Form` table. The data in that column could be lost. The data in that column will be cast from `Timestamp(0)` to `Timestamp`.
  - You are about to drop the column `position_id` on the `Input` table. All the data in the column will be lost.
  - You are about to drop the column `form_id` on the `Position` table. All the data in the column will be lost.
  - Added the required column `userId` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `positionId` to the `Input` table without a default value. This is not possible if the table is not empty.
  - Added the required column `formId` to the `Position` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE `Form` DROP FOREIGN KEY `Form_user_id_fkey`;

-- DropForeignKey
ALTER TABLE `Input` DROP FOREIGN KEY `Input_position_id_fkey`;

-- DropForeignKey
ALTER TABLE `Position` DROP FOREIGN KEY `Position_form_id_fkey`;

-- AlterTable
ALTER TABLE `Form` DROP COLUMN `user_id`,
    ADD COLUMN `userId` INTEGER NOT NULL,
    MODIFY `last_opened` TIMESTAMP NOT NULL;

-- AlterTable
ALTER TABLE `Input` DROP COLUMN `position_id`,
    ADD COLUMN `positionId` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Position` DROP COLUMN `form_id`,
    ADD COLUMN `formId` INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE `Form` ADD CONSTRAINT `Form_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Position` ADD CONSTRAINT `Position_formId_fkey` FOREIGN KEY (`formId`) REFERENCES `Form`(`form_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Input` ADD CONSTRAINT `Input_positionId_fkey` FOREIGN KEY (`positionId`) REFERENCES `Position`(`position_id`) ON DELETE CASCADE ON UPDATE CASCADE;
