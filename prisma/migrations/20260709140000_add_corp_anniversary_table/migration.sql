-- CreateTable
CREATE TABLE "corp_anniversary" (
    "idx" SERIAL NOT NULL,
    "corp_id" VARCHAR(10) NOT NULL,
    "anniv" INTEGER NOT NULL,
    "start_date" DATE NOT NULL,
    "end_date" DATE NOT NULL,
    "renewal_date" DATE NOT NULL,
    "agent_id" VARCHAR(10) NOT NULL,
    "user_id" VARCHAR(10),
    "date_entered" DATE,
    "sync" DECIMAL(10,0),
    "smart_sync" DECIMAL(10,0),

    CONSTRAINT "corp_anniversary_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE INDEX "corp_anniversary_corp_id_idx" ON "corp_anniversary"("corp_id");

-- AddForeignKey
ALTER TABLE "corp_anniversary" ADD CONSTRAINT "corp_anniversary_corp_id_fkey" FOREIGN KEY ("corp_id") REFERENCES "Corporate"("corp_id") ON DELETE CASCADE ON UPDATE CASCADE;
