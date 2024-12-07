-- AlterTable
ALTER TABLE `user` ADD COLUMN `role` ENUM('Admin', 'User') NOT NULL DEFAULT 'User';
