/*
  Warnings:

  - You are about to drop the `item_images` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "item_images" DROP CONSTRAINT "item_images_itemId_fkey";

-- DropForeignKey
ALTER TABLE "item_images" DROP CONSTRAINT "item_images_uploaderId_fkey";

-- AlterTable
ALTER TABLE "items" ADD COLUMN     "images" TEXT[];

-- DropTable
DROP TABLE "item_images";
