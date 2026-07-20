-- CreateEnum
CREATE TYPE "AdminSystemAccess" AS ENUM ('MEDICAL', 'GENERAL', 'AVIATION');

-- AlterTable
ALTER TABLE "AdminUser" ADD COLUMN "password_hash" TEXT NOT NULL DEFAULT '';
ALTER TABLE "AdminUser" ADD COLUMN "allowed_systems" "AdminSystemAccess"[] DEFAULT ARRAY[]::"AdminSystemAccess"[];

ALTER TABLE "AdminUser" ALTER COLUMN "password_hash" DROP DEFAULT;
