-- DropForeignKey
ALTER TABLE "RentalItem" DROP CONSTRAINT "RentalItem_gearId_fkey";

-- AddForeignKey
ALTER TABLE "RentalItem" ADD CONSTRAINT "RentalItem_gearId_fkey" FOREIGN KEY ("gearId") REFERENCES "gear_items"("id") ON DELETE CASCADE ON UPDATE CASCADE;
