-- CreateTable
CREATE TABLE "principal_applicant" (
    "idx" SERIAL NOT NULL,
    "family_no" VARCHAR(20) NOT NULL,
    "member_no" VARCHAR(20) NOT NULL,
    "surname" VARCHAR(40),
    "first_name" VARCHAR(40),
    "other_names" VARCHAR(40),
    "agent_id" VARCHAR(10),
    "corp_id" VARCHAR(10),
    "employer" VARCHAR(10),
    "tel_no" VARCHAR(20),
    "mobile_no" VARCHAR(20),
    "postal_add" VARCHAR(15),
    "town" INTEGER,
    "email" VARCHAR(30),
    "phy_loc" VARCHAR(100),
    "family_size" INTEGER,
    "relation_to_family" INTEGER,
    "individual" DECIMAL(1,0),
    "date_form_received" DATE,
    "witnessed" INTEGER,
    "date_witnessed" DATE,
    "user_id" VARCHAR(10),
    "date_entered" DATE,
    "province" INTEGER,
    "form_filled" INTEGER,
    "department" INTEGER,
    "insurer" INTEGER,
    "category" VARCHAR(10),
    "marital_status" INTEGER,
    "date_employed" DATE,
    "previous_insurer" VARCHAR(20),
    "period_insured" VARCHAR(20),
    "beneficiary" VARCHAR(20),
    "beneficiary_id" VARCHAR(10),
    "beneficiary_relation" VARCHAR(10),
    "policy_no" VARCHAR(30),
    "pin_no" VARCHAR(15),
    "branch" INTEGER,
    "share_data" INTEGER,

    CONSTRAINT "principal_applicant_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE UNIQUE INDEX "principal_applicant_member_no_key" ON "principal_applicant"("member_no");

-- CreateIndex
CREATE INDEX "principal_applicant_corp_id_idx" ON "principal_applicant"("corp_id");

-- CreateIndex
CREATE INDEX "principal_applicant_family_no_idx" ON "principal_applicant"("family_no");
