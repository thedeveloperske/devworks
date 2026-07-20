-- RenameTable
ALTER TABLE IF EXISTS "Corporate" RENAME TO "corporate";

-- Re-point corp_anniversary FK to the renamed table
ALTER TABLE "corp_anniversary" DROP CONSTRAINT IF EXISTS "corp_anniversary_corp_id_fkey";

ALTER TABLE "corp_anniversary"
ADD CONSTRAINT "corp_anniversary_corp_id_fkey"
FOREIGN KEY ("corp_id") REFERENCES "corporate"("corp_id") ON DELETE CASCADE ON UPDATE CASCADE;
