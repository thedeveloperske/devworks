-- CreateTable
CREATE TABLE "claim_form" (
    "claim_no" VARCHAR(20) NOT NULL,
    "visit_date" DATE NOT NULL,
    "attending_doc" DECIMAL(5,0),
    "doctor_sign" DECIMAL(1,0),
    "doctor_date" DATE,
    "claim_form_signed" DECIMAL(1,0),
    "date_admitted" DATE,
    "date_discharged" DATE,
    "user_id" VARCHAR(10),
    "date_entered" DATE,
    "visit_days" DECIMAL(5,0),

    CONSTRAINT "claim_form_pkey" PRIMARY KEY ("claim_no")
);
