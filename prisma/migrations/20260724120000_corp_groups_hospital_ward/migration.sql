-- Add hospital ward reference to corporate benefit categorization rows.
ALTER TABLE "corp_groups" ADD COLUMN IF NOT EXISTS "hospital_ward" INTEGER;
