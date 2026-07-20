-- CreateTable
CREATE TABLE "benefit" (
    "code" SERIAL NOT NULL,
    "benefit" VARCHAR(255) NOT NULL,
    "bene_class" INTEGER,

    CONSTRAINT "benefit_pkey" PRIMARY KEY ("code")
);
