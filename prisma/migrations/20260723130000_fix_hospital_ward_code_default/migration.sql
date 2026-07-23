-- Ensure hospital ward code has a working autoincrement default.
-- Production may have the table without a sequence (causing P2011 on create).

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_schema = 'public'
      AND table_name = 't_hospital_ward'
  ) THEN
    CREATE TABLE "t_hospital_ward" (
      "code" SERIAL NOT NULL,
      "ward" VARCHAR(50) NOT NULL,
      CONSTRAINT "t_hospital_ward_pkey" PRIMARY KEY ("code")
    );
    RETURN;
  END IF;

  -- Convert non-integer code columns to integer when possible.
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 't_hospital_ward'
      AND column_name = 'code'
      AND data_type <> 'integer'
  ) THEN
    ALTER TABLE "t_hospital_ward"
      ALTER COLUMN "code" TYPE INTEGER
      USING ROUND("code"::numeric)::integer;
  END IF;

  IF NOT EXISTS (
    SELECT 1
    FROM pg_class
    WHERE relkind = 'S'
      AND relname = 't_hospital_ward_code_seq'
  ) THEN
    CREATE SEQUENCE "t_hospital_ward_code_seq";
  END IF;

  PERFORM setval(
    't_hospital_ward_code_seq',
    GREATEST(
      1,
      COALESCE((SELECT MAX(code) FROM t_hospital_ward), 0)
    )
  );

  ALTER TABLE "t_hospital_ward"
    ALTER COLUMN "code" SET DEFAULT nextval('t_hospital_ward_code_seq'::regclass);

  ALTER SEQUENCE "t_hospital_ward_code_seq" OWNED BY "t_hospital_ward"."code";
END $$;
