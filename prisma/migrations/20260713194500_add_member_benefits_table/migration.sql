-- CreateTable
CREATE TABLE "member_benefits" (
    "member_no" VARCHAR(20) NOT NULL,
    "benefit" INTEGER NOT NULL,
    "anniv" INTEGER NOT NULL,
    "limit" DECIMAL(10,2),
    "sharing" INTEGER,
    "re_insurer" INTEGER,
    "sub_limit_of" INTEGER,
    "suspended" INTEGER,
    "suspended_date" DATE,
    "suspend_reason" INTEGER,
    "suspend_user" VARCHAR(10),
    "suspended_entry" DATE,
    "expense" DECIMAL(10,2),
    "balance" DECIMAL(10,2),
    "percent" DECIMAL(5,2),
    "status" VARCHAR(20),
    "reserve" DECIMAL(10,2),
    "claims" DECIMAL(10,2),
    "fund" INTEGER,
    "cap" DECIMAL(15,2),
    "copay_amount" DECIMAL(15,2),
    "corp_id" VARCHAR(15),
    "change_factor" DECIMAL(15,2),
    "ceiling" INTEGER,
    "change_limit" DECIMAL(15,2),
    "status_user" VARCHAR(15),
    "verify_status" INTEGER,
    "waiting_period" INTEGER,
    "sync" INTEGER,
    "allocate_to" INTEGER,

    CONSTRAINT "member_benefits_pkey" PRIMARY KEY ("member_no","benefit","anniv")
);

-- CreateIndex
CREATE INDEX "member_benefits_corp_id_idx" ON "member_benefits"("corp_id");
