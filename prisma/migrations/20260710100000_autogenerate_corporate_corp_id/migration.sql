-- CreateSequence
CREATE SEQUENCE IF NOT EXISTS corporate_corp_id_seq;

-- Backfill missing corp_id values
UPDATE corporate
SET corp_id = lpad(nextval('corporate_corp_id_seq')::text, 10, '0')
WHERE corp_id IS NULL OR btrim(corp_id) = '';

-- Align sequence with existing numeric corp_id values
SELECT setval(
  'corporate_corp_id_seq',
  GREATEST(
    1,
    COALESCE((
      SELECT MAX(corp_id::bigint)
      FROM corporate
      WHERE corp_id ~ '^[0-9]+$'
    ), 0)
  )
);

-- AlterTable
ALTER TABLE corporate
ALTER COLUMN corp_id TYPE VARCHAR(10) USING left(corp_id, 10),
ALTER COLUMN corp_id SET DEFAULT lpad(nextval('corporate_corp_id_seq'::regclass)::text, 10, '0'),
ALTER COLUMN corp_id SET NOT NULL;
