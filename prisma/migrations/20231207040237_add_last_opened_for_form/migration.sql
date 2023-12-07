/*
  Warnings:

  - Added the required column `last_opened` to the `Form` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE `Form` ADD COLUMN `last_opened` TIMESTAMP NOT NULL;
