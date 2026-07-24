-- Add hospital ward reference to member benefit rows.
ALTER TABLE "member_benefits" ADD COLUMN IF NOT EXISTS "hospital_ward" INTEGER;
