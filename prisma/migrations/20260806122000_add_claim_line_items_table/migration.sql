CREATE TABLE "claim_line_items" (
  "id" SERIAL NOT NULL,
  "claim_no" VARCHAR(20) NOT NULL,
  "invoice_no" VARCHAR(30) NOT NULL,
  "service" DECIMAL(10,0) NOT NULL,
  "item_code" VARCHAR(30) NOT NULL,
  "item_name" VARCHAR(255) NOT NULL,
  "group_name" VARCHAR(100),
  "quantity" DECIMAL(10,2) NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "unit_price" DECIMAL(12,2) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "claim_line_items_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "claim_line_items_claim_no_idx" ON "claim_line_items"("claim_no");
CREATE INDEX "claim_line_items_invoice_no_idx" ON "claim_line_items"("invoice_no");
