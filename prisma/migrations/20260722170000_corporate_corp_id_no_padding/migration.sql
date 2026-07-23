-- Use plain sequence numbers for corp_id (1, 2, 3…) instead of zero-padded values.
ALTER TABLE "corporate"
ALTER COLUMN "corp_id" SET DEFAULT nextval('corporate_corp_id_seq'::regclass)::text;

-- Strip leading zeros only when the unpadded value is not already taken.
UPDATE "corporate" AS c
SET "corp_id" = (c."corp_id"::bigint)::text
WHERE c."corp_id" ~ '^[0-9]+$'
  AND c."corp_id" <> (c."corp_id"::bigint)::text
  AND NOT EXISTS (
    SELECT 1
    FROM "corporate" AS other
    WHERE other."corp_id" = (c."corp_id"::bigint)::text
      AND other."id" <> c."id"
  );

-- Tables that store corp_id without a FK to corporate.
UPDATE "principal_applicant"
SET "corp_id" = ("corp_id"::bigint)::text
WHERE "corp_id" ~ '^[0-9]+$'
  AND "corp_id" <> ("corp_id"::bigint)::text;

UPDATE "member_info"
SET "corp_id" = ("corp_id"::bigint)::text
WHERE "corp_id" ~ '^[0-9]+$'
  AND "corp_id" <> ("corp_id"::bigint)::text;

UPDATE "member_benefits"
SET "corp_id" = ("corp_id"::bigint)::text
WHERE "corp_id" ~ '^[0-9]+$'
  AND "corp_id" <> ("corp_id"::bigint)::text;

-- Rebuild policy numbers that embedded the old padded corp_id.
UPDATE "corporate"
SET "policy_no" = 'POL-00' || "corp_id" || RIGHT("policy_no", 4)
WHERE "policy_no" ~ '^POL-00[0-9]+[0-9]{4}$'
  AND "corp_id" ~ '^[0-9]+$';
