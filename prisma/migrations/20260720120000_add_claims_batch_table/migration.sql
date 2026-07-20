-- CreateTable
CREATE TABLE "claims_batch" (
    "idx" SERIAL NOT NULL,
    "batch_no" VARCHAR(10),
    "batch_date" DATE,
    "batch_user" VARCHAR(100),
    "claims_count" DECIMAL(3,0),
    "data_entry_user" VARCHAR(100),
    "date_entry_date" DATE,
    "vetting_user" VARCHAR(100),
    "vetting_user_date" DATE,
    "authorising_user" VARCHAR(100),
    "authorising_user_date" DATE,
    "finance_user" VARCHAR(100),
    "finance_user_date" DATE,
    "provider" DECIMAL(5,0),
    "date_received" DATE,

    CONSTRAINT "claims_batch_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE INDEX "claims_batch_batch_no_idx" ON "claims_batch"("batch_no");

-- CreateIndex
CREATE INDEX "claims_batch_provider_idx" ON "claims_batch"("provider");
