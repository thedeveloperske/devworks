-- CreateTable
CREATE TABLE "client_rates" (
    "benefit" DECIMAL(10,0) NOT NULL,
    "premium_type" DECIMAL(2,0),
    "family_size" DECIMAL(2,0),
    "limit" DECIMAL(10,2),
    "premium" DECIMAL(10,2),
    "min_age" DECIMAL(3,0),
    "max_age" DECIMAL(3,0),
    "re_rate" DECIMAL(10,2),
    "individual" DECIMAL(2,0),
    "insurer" DECIMAL(2,0),
    "idx" SERIAL NOT NULL,
    "corp_id" VARCHAR(10),
    "family_no" VARCHAR(15),
    "year" DECIMAL(3,0),
    "policy_no" VARCHAR(30),
    "family_title" DECIMAL(2,0),

    CONSTRAINT "client_rates_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE INDEX "client_rates_corp_id_idx" ON "client_rates"("corp_id");

-- AddForeignKey
ALTER TABLE "client_rates" ADD CONSTRAINT "client_rates_corp_id_fkey" FOREIGN KEY ("corp_id") REFERENCES "corporate"("corp_id") ON DELETE CASCADE ON UPDATE CASCADE;
