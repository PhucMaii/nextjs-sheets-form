-- CreateTable
CREATE TABLE `User` (
    `id` INTEGER NOT NULL AUTO_INCREMENT,
    `email` VARCHAR(255) NOT NULL,
    `password` VARCHAR(255) NOT NULL,
    `first_name` VARCHAR(255) NOT NULL,

    UNIQUE INDEX `User_email_key`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Form` (
    `form_id` INTEGER NOT NULL AUTO_INCREMENT,
    `form_name` VARCHAR(255) NOT NULL,
    `last_opened` TIMESTAMP NOT NULL,
    `user_id` INTEGER NOT NULL,

    PRIMARY KEY (`form_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Position` (
    `position_id` INTEGER NOT NULL AUTO_INCREMENT,
    `sheet_name` VARCHAR(255) NOT NULL,
    `row` INTEGER NOT NULL,
    `form_id` INTEGER NOT NULL,

    PRIMARY KEY (`position_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `Input` (
    `input_id` INTEGER NOT NULL AUTO_INCREMENT,
    `input_name` VARCHAR(255) NOT NULL,
    `input_type` VARCHAR(10) NOT NULL,
    `position_id` INTEGER NOT NULL,

    PRIMARY KEY (`input_id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `Form` ADD CONSTRAINT `Form_user_id_fkey` FOREIGN KEY (`user_id`) REFERENCES `User`(`id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Position` ADD CONSTRAINT `Position_form_id_fkey` FOREIGN KEY (`form_id`) REFERENCES `Form`(`form_id`) ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `Input` ADD CONSTRAINT `Input_position_id_fkey` FOREIGN KEY (`position_id`) REFERENCES `Position`(`position_id`) ON DELETE CASCADE ON UPDATE CASCADE;
