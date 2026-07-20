-- CreateTable
CREATE TABLE "CoverPeriod" (
    "id" TEXT NOT NULL,
    "corporateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CoverPeriod_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BenefitCategory" (
    "id" TEXT NOT NULL,
    "corporateId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "BenefitCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Benefit" (
    "id" TEXT NOT NULL,
    "corporateId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "limitAmount" DECIMAL(12,2),
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Benefit_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "CoverPeriod_corporateId_idx" ON "CoverPeriod"("corporateId");

-- CreateIndex
CREATE INDEX "BenefitCategory_corporateId_idx" ON "BenefitCategory"("corporateId");

-- CreateIndex
CREATE INDEX "Benefit_corporateId_idx" ON "Benefit"("corporateId");

-- CreateIndex
CREATE INDEX "Benefit_categoryId_idx" ON "Benefit"("categoryId");

-- AddForeignKey
ALTER TABLE "CoverPeriod" ADD CONSTRAINT "CoverPeriod_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "Corporate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BenefitCategory" ADD CONSTRAINT "BenefitCategory_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "Corporate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "Corporate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Benefit" ADD CONSTRAINT "Benefit_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "BenefitCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;
