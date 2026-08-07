-- Drop old varchar id column and switch primary key to autoincrement id.
ALTER TABLE "bills" DROP CONSTRAINT "bills_pkey";

ALTER TABLE "bills" DROP COLUMN IF EXISTS "id";

CREATE SEQUENCE "bills_id_seq";

ALTER TABLE "bills"
  ADD COLUMN "id" INTEGER NOT NULL DEFAULT nextval('bills_id_seq');

ALTER SEQUENCE "bills_id_seq" OWNED BY "bills"."id";

ALTER TABLE "bills"
  ADD CONSTRAINT "bills_pkey" PRIMARY KEY ("id");

CREATE UNIQUE INDEX "bills_invoice_no_key" ON "bills"("invoice_no");
