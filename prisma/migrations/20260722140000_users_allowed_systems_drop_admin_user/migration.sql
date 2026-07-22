-- Add allowed_systems to users (reuse existing AdminSystemAccess enum)
ALTER TABLE "users"
ADD COLUMN IF NOT EXISTS "allowed_systems" "AdminSystemAccess"[] DEFAULT ARRAY[]::"AdminSystemAccess"[];

-- Remove legacy AdminUser auth table and unused enums
DROP TABLE IF EXISTS "AdminUser";
DROP TYPE IF EXISTS "AdminRole";
DROP TYPE IF EXISTS "AdminUserStatus";
