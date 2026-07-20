-- DropForeignKey
ALTER TABLE "Claim" DROP CONSTRAINT IF EXISTS "Claim_memberId_fkey";
ALTER TABLE "Preauthorization" DROP CONSTRAINT IF EXISTS "Preauthorization_memberId_fkey";
ALTER TABLE "Premium" DROP CONSTRAINT IF EXISTS "Premium_memberId_fkey";

-- DropTable
DROP TABLE IF EXISTS "Member";
