-- CreateTable
CREATE TABLE "member_acceptance" (
    "member_no" VARCHAR(20) NOT NULL,
    "status" DECIMAL(1,0) NOT NULL,
    "status_date" DATE,
    "comments" VARCHAR(70),
    "user_id" VARCHAR(10),
    "date_entered" DATE,
    "def_rej" SMALLINT,

    CONSTRAINT "member_acceptance_pkey" PRIMARY KEY ("member_no")
);
