-- CreateTable
CREATE TABLE "t_hospital_ward" (
    "code" SERIAL NOT NULL,
    "ward" VARCHAR(50) NOT NULL,

    CONSTRAINT "t_hospital_ward_pkey" PRIMARY KEY ("code")
);
