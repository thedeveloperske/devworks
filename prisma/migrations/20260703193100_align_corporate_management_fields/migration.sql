ALTER TABLE "Corporate" RENAME COLUMN "phy_loc" TO "physical_location";

ALTER TABLE "Corporate" ADD COLUMN "business_class" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "currency" TEXT;
ALTER TABLE "Corporate" ADD COLUMN "channel" TEXT;
