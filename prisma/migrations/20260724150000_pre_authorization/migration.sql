-- Replace scaffold Preauthorization with legacy pre_authorization table.
DROP TABLE IF EXISTS "Preauthorization";
DROP TYPE IF EXISTS "PreauthStatus";

CREATE TABLE "pre_authorization" (
    "code" SERIAL NOT NULL,
    "member_no" VARCHAR(23) NOT NULL,
    "provider" DECIMAL(5,0) NOT NULL,
    "date_reported" DATE,
    "reported_by" VARCHAR(20),
    "date_authorized" DATE,
    "authorized_by" VARCHAR(10),
    "pre_diagnosis" VARCHAR(60),
    "authority_type" DECIMAL(3,0),
    "ward" DECIMAL(2,0),
    "available_limit" DECIMAL(10,2),
    "admit_days" DECIMAL(3,0),
    "reserve" DECIMAL(10,2),
    "notes" VARCHAR(255),
    "co_signee" VARCHAR(30),
    "anniv" DECIMAL(2,0),
    "clinincal_procedure" VARCHAR(100),
    "doctor_1" VARCHAR(100),
    "doctor_2" VARCHAR(100),
    "batch_no" DECIMAL(10,0),
    "bed_limit" DECIMAL(15,2),
    "validity_date" DATE,
    "care_notes" VARCHAR(255),

    CONSTRAINT "pre_authorization_pkey" PRIMARY KEY ("code")
);

CREATE INDEX "pre_authorization_member_no_idx" ON "pre_authorization"("member_no");
CREATE INDEX "pre_authorization_provider_idx" ON "pre_authorization"("provider");
