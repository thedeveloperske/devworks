-- Claims reserve ledger linked to pre-authorizations.
CREATE TABLE "claims_reserve" (
    "id" BIGSERIAL NOT NULL,
    "pre_auth_no" DECIMAL(7,0),
    "member_no" VARCHAR(15),
    "trans_type" DECIMAL(1,0),
    "debit" DECIMAL(10,2),
    "credit" DECIMAL(10,2),
    "user_id" VARCHAR(10),
    "date_entered" DATE,
    "benefit" DECIMAL(5,0),
    "anniv" DECIMAL(2,0),
    "claim_no" VARCHAR(20),
    "invoice_no" VARCHAR(20),
    "service" DECIMAL(5,0),
    "provider" DECIMAL(5,0),
    "notes" VARCHAR(50),
    "batch_no" DECIMAL(5,0),

    CONSTRAINT "claims_reserve_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "claims_reserve_pre_auth_no_idx" ON "claims_reserve"("pre_auth_no");
CREATE INDEX "claims_reserve_member_no_idx" ON "claims_reserve"("member_no");
