-- CreateTable
CREATE TABLE IF NOT EXISTS "member_diagnosis" (
    "id" SERIAL NOT NULL,
    "claim_no" VARCHAR(20) NOT NULL,
    "member_no" VARCHAR(20) NOT NULL,
    "diagnosis" DECIMAL(5,0) NOT NULL,

    CONSTRAINT "member_diagnosis_pkey" PRIMARY KEY ("id")
);
