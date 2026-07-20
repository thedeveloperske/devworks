-- CreateTable
CREATE TABLE "member_info" (
    "member_no" VARCHAR(20) NOT NULL,
    "family_no" VARCHAR(20) NOT NULL,
    "surname" VARCHAR(40),
    "first_name" VARCHAR(40),
    "other_names" VARCHAR(40),
    "dob" DATE,
    "occupation" INTEGER,
    "id_pp_no" VARCHAR(30),
    "blood_group" INTEGER,
    "relation_to_principal" INTEGER,
    "user_id" VARCHAR(10),
    "date_entered" DATE,
    "family_title" INTEGER,
    "dealing_user" VARCHAR(10),
    "cancelled" INTEGER,
    "employment_no" VARCHAR(15),
    "gender" INTEGER,
    "card_to_member" DATE,
    "passport_no" VARCHAR(15),
    "nhif_card_no" VARCHAR(15),
    "height" VARCHAR(10),
    "weight" VARCHAR(10),
    "photo_n_form" INTEGER,
    "photo_no" INTEGER,
    "info_to_printer" DATE,
    "card_from_printer" DATE,
    "app_form_date" DATE,
    "marital_status" INTEGER,
    "date_employed" DATE,
    "dep_pos" INTEGER,
    "corp_id" VARCHAR(14),
    "mobile_no" VARCHAR(30),
    "email_add" VARCHAR(30),

    CONSTRAINT "member_info_pkey" PRIMARY KEY ("member_no")
);

-- CreateIndex
CREATE INDEX "member_info_family_no_idx" ON "member_info"("family_no");

-- CreateIndex
CREATE INDEX "member_info_corp_id_idx" ON "member_info"("corp_id");
