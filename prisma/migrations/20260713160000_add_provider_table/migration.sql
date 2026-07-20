-- CreateTable
CREATE TABLE "provider" (
    "code" SERIAL NOT NULL,
    "provider" VARCHAR(255) NOT NULL,
    "country" INTEGER,
    "pin_no" VARCHAR(50),
    "phone_no" VARCHAR(50),
    "mobile_no" VARCHAR(50),
    "email" VARCHAR(255),
    "address" VARCHAR(255),
    "town" INTEGER,
    "physical_loc" VARCHAR(255),
    "contact_person" VARCHAR(255),
    "date_entered" DATE,
    "created_by" VARCHAR(50),
    "approved" BOOLEAN,
    "approved_by" VARCHAR(50),
    "approved_date" DATE,
    "tel_no" VARCHAR(50),
    "bank_acct" VARCHAR(50),
    "bank" VARCHAR(50),
    "mapped" VARCHAR(50),
    "bank_branch" VARCHAR(50),
    "user_id" VARCHAR(50),
    "status" VARCHAR(50),

    CONSTRAINT "provider_pkey" PRIMARY KEY ("code")
);
