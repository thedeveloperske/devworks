-- CreateTable
CREATE TABLE "corp_contact_person" (
    "idx" SERIAL NOT NULL,
    "corp_id" VARCHAR(10) NOT NULL,
    "title" INTEGER,
    "surname" VARCHAR(20),
    "first_name" VARCHAR(20),
    "other_names" VARCHAR(20),
    "job_title" INTEGER NOT NULL,
    "mobile_no" VARCHAR(30),
    "tel_no" VARCHAR(20),
    "email" VARCHAR(40),

    CONSTRAINT "corp_contact_person_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE INDEX "corp_contact_person_corp_id_idx" ON "corp_contact_person"("corp_id");

-- AddForeignKey
ALTER TABLE "corp_contact_person" ADD CONSTRAINT "corp_contact_person_corp_id_fkey" FOREIGN KEY ("corp_id") REFERENCES "corporate"("corp_id") ON DELETE CASCADE ON UPDATE CASCADE;
