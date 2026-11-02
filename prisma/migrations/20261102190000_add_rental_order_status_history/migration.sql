CREATE TABLE "rental_order_status_history" (
    "id" TEXT NOT NULL,
    "orderId" TEXT NOT NULL,
    "status" "OrderStatus" NOT NULL,
    "changedById" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "rental_order_status_history_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "rental_order_status_history_orderId_createdAt_idx"
ON "rental_order_status_history"("orderId", "createdAt");

ALTER TABLE "rental_order_status_history"
ADD CONSTRAINT "rental_order_status_history_orderId_fkey"
FOREIGN KEY ("orderId") REFERENCES "rentalOrders"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "rental_order_status_history" ("id", "orderId", "status", "changedById", "createdAt")
SELECT md5("id" || ':placed'), "id", 'PLACED', "customerId", "createdAt"
FROM "rentalOrders";

INSERT INTO "rental_order_status_history" ("id", "orderId", "status", "changedById", "createdAt")
SELECT md5("id" || ':current-status'), "id", "status", NULL, "updatedAt"
FROM "rentalOrders"
WHERE "status" <> 'PLACED';
