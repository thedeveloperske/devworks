-- CreateTable
CREATE TABLE "corp_groups" (
    "idx" SERIAL NOT NULL,
    "corp_id" VARCHAR(10),
    "anniv" DECIMAL(2,0),
    "category" VARCHAR(10),
    "benefit" INTEGER,
    "fund" INTEGER,
    "limit" DECIMAL(10,0),
    "sub_limit_of" INTEGER,
    "sharing" INTEGER,
    "cap" DECIMAL(15,2),
    "copay_amount" DECIMAL(15,2),
    "size" DECIMAL(2,0),
    "plan" INTEGER,
    "change_factor" DECIMAL(15,2),
    "ceiling" DECIMAL(5,0),
    "status" INTEGER,
    "status_user" VARCHAR(15),
    "waiting_period" INTEGER,
    "sync" INTEGER,
    "deactivate" INTEGER,
    "activation_sync" INTEGER,
    "activation_user" VARCHAR(50),
    "deactivate_reason" INTEGER,
    "allocate_to" INTEGER,
    "is_renewed" VARCHAR(30),

    CONSTRAINT "corp_groups_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE INDEX "corp_groups_corp_id_idx" ON "corp_groups"("corp_id");

-- AddForeignKey
ALTER TABLE "corp_groups" ADD CONSTRAINT "corp_groups_corp_id_fkey" FOREIGN KEY ("corp_id") REFERENCES "corporate"("corp_id") ON DELETE CASCADE ON UPDATE CASCADE;
