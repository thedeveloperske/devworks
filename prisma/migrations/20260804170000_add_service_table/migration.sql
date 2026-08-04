-- CreateTable
CREATE TABLE IF NOT EXISTS "service" (
    "code" INTEGER NOT NULL,
    "service" VARCHAR(100) NOT NULL,

    CONSTRAINT "service_pkey" PRIMARY KEY ("code")
);
