/*
  Warnings:

  - Added the required column `providerId` to the `rentalOrders` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "rentalOrders" ADD COLUMN     "providerId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "rentalOrders" ADD CONSTRAINT "rentalOrders_providerId_fkey" FOREIGN KEY ("providerId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
