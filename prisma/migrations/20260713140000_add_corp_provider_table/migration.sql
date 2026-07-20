-- CreateTable
CREATE TABLE "corp_provider" (
    "idx" SERIAL NOT NULL,
    "provider" DECIMAL(5,0) NOT NULL,
    "corp_id" VARCHAR(10) NOT NULL,
    "sync" DECIMAL(10,0),
    "smart_sync" DECIMAL(10,0),
    "anniv" DECIMAL(10,0),

    CONSTRAINT "corp_provider_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE INDEX "corp_provider_corp_id_idx" ON "corp_provider"("corp_id");

-- AddForeignKey
ALTER TABLE "corp_provider" ADD CONSTRAINT "corp_provider_corp_id_fkey" FOREIGN KEY ("corp_id") REFERENCES "corporate"("corp_id") ON DELETE CASCADE ON UPDATE CASCADE;
