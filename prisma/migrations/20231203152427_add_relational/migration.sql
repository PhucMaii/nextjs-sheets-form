/*
  Warnings:

  - You are about to drop the column `row` on the `Input` table. All the data in the column will be lost.
  - You are about to drop the column `sheet_name` on the `Input` table. All the data in the column will be lost.
  - Added the required column `user_id` to the `Form` table without a default value. This is not possible if the table is not empty.
  - Added the required column `input_name` to the `Input` table without a default value. This is not possible if the table is not empty.
  - Added the required column `input_type` to the `Input` table without a default value. This is not possible if the table is not empty.
  - Added the required column `position_id` to the `Input` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Form` ADD COLUMN `user_id` INTEGER NOT NULL;

-- AlterTable
ALTER TABLE `Input` DROP COLUMN `row`,
    DROP COLUMN `sheet_name`,
    ADD COLUMN `input_name` VARCHAR(255) NOT NULL,
    ADD COLUMN `input_type` VARCHAR(10) NOT NULL,
    ADD COLUMN `position_id` INTEGER NOT NULL;

-- CreateTable
CREATE TABLE `Position` (
    `position_id` INTEGER NOT NULL AUTO_INCREMENT,
    `sheet_name` VARCHAR(255) NOT NULL,
    `row` INTEGER NOT NULL,
    `form_id` INTEGER NOT NULL,

    PRIMARY KEY (`position_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Form` ADD CONSTRAINT `Form_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Position` ADD CONSTRAINT `Position_form_id_fkey` FOREIGN KEY (`form_id`) REFERENCES `Form`(`form_id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Input` ADD CONSTRAINT `Input_position_id_fkey` FOREIGN KEY (`position_id`) REFERENCES `Position`(`position_id`) ON DELETE RESTRICT ON UPDATE CASCADE;
