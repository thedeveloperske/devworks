-- Rename company name column to match legacy field
ALTER TABLE "Corporate" RENAME COLUMN "name" TO "corporate";

-- Add new corporate management columns
ALTER TABLE "Corporate" ADD COLUMN "corp_id" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "tel_no" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "mobile_no" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "postal_add" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "town" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "phy_loc" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "user_id" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "agent_id" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "scheme" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "cancelled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Corporate" ADD COLUMN "policy_no" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "individual" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Corporate" ADD COLUMN "date_entered" TIMESTAMP(3);
ALTER TABLE "Corporate" ADD COLUMN "branch" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "notes" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "pin_number" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "occupation" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "share_data" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Corporate" ADD COLUMN "fax_no" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "insurer" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "underwrite" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Corporate" ADD COLUMN "waiting_period" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "enhanced" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "Corporate" ADD COLUMN "acct_no" TEXT;

-- Migrate data from previous schema
UPDATE "Corporate"
SET
  "corp_id" = "registrationNumber",
  "tel_no" = "phone",
  "postal_add" = "address",
  "cancelled" = ("status" <> 'ACTIVE'),
  "date_entered" = "createdAt";

-- Remove deprecated columns and enum
DROP INDEX IF EXISTS "Corporate_registrationNumber_key";
ALTER TABLE "Corporate" DROP COLUMN "registrationNumber";
ALTER TABLE "Corporate" DROP COLUMN "phone";
ALTER TABLE "Corporate" DROP COLUMN "address";
ALTER TABLE "Corporate" DROP COLUMN "status";
DROP TYPE "CorporateStatus";

-- Unique constraint on business corp ID
CREATE UNIQUE INDEX "Corporate_corp_id_key" ON "Corporate"("corp_id");
