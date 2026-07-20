-- CreateTable
CREATE TABLE "member_anniversary" (
    "member_no" VARCHAR(20) NOT NULL,
    "anniv" INTEGER NOT NULL,
    "start_date" DATE,
    "end_date" DATE,
    "renewal_date" DATE,
    "user_id" VARCHAR(10),
    "date_entered" DATE,
    "sync" INTEGER,
    "renewal_notes" VARCHAR(100),
    "invoice_no" VARCHAR(15),
    "commis_rate" DECIMAL(10,2),
    "whtax_rate" DECIMAL(10,2),
    "sum_insured" DECIMAL(10,2),
    "status_user" VARCHAR(15),
    "status" INTEGER,
    "smart_sync" INTEGER,
    "branch" INTEGER,
    "unit_manager" INTEGER,

    CONSTRAINT "member_anniversary_pkey" PRIMARY KEY ("member_no","anniv")
);
