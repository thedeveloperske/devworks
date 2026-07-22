-- CreateTable
CREATE TABLE IF NOT EXISTS "users" (
    "id" SERIAL NOT NULL,
    "username" VARCHAR,
    "password" TEXT,
    "full_name" VARCHAR,
    "department" INTEGER,
    "status" INTEGER DEFAULT 1,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);
