-- CreateEnum
CREATE TYPE "ClaimStatus" AS ENUM ('SUBMITTED', 'UNDER_REVIEW', 'APPROVED', 'REJECTED', 'PAID');

-- CreateEnum
CREATE TYPE "PreauthStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "PremiumStatus" AS ENUM ('PENDING', 'PAID', 'OVERDUE', 'CANCELLED');

-- CreateEnum
CREATE TYPE "CommissionStatus" AS ENUM ('PENDING', 'APPROVED', 'PAID');

-- CreateEnum
CREATE TYPE "TreatyType" AS ENUM ('QUOTA_SHARE', 'SURPLUS', 'EXCESS_OF_LOSS');

-- CreateEnum
CREATE TYPE "TreatyStatus" AS ENUM ('ACTIVE', 'EXPIRED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "AdminRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'OPERATOR', 'VIEWER');

-- CreateEnum
CREATE TYPE "AdminUserStatus" AS ENUM ('ACTIVE', 'INACTIVE');

-- CreateTable
CREATE TABLE "Claim" (
    "id" TEXT NOT NULL,
    "claimNumber" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "providerName" TEXT,
    "serviceDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(12,2) NOT NULL,
    "approvedAmount" DECIMAL(12,2),
    "status" "ClaimStatus" NOT NULL DEFAULT 'SUBMITTED',
    "diagnosis" TEXT,
    "description" TEXT,
    "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Claim_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Preauthorization" (
    "id" TEXT NOT NULL,
    "preauthNumber" TEXT NOT NULL,
    "memberId" TEXT NOT NULL,
    "providerName" TEXT,
    "serviceDate" TIMESTAMP(3),
    "requestedAmount" DECIMAL(12,2) NOT NULL,
    "approvedAmount" DECIMAL(12,2),
    "status" "PreauthStatus" NOT NULL DEFAULT 'PENDING',
    "procedureCode" TEXT,
    "diagnosis" TEXT,
    "validUntil" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Preauthorization_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Premium" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "corporateId" TEXT NOT NULL,
    "memberId" TEXT,
    "amount" DECIMAL(12,2) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "paidDate" TIMESTAMP(3),
    "status" "PremiumStatus" NOT NULL DEFAULT 'PENDING',
    "paymentMethod" TEXT,
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Premium_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Commission" (
    "id" TEXT NOT NULL,
    "referenceNumber" TEXT NOT NULL,
    "corporateId" TEXT,
    "agentName" TEXT NOT NULL,
    "agentCode" TEXT,
    "premiumAmount" DECIMAL(12,2) NOT NULL,
    "commissionRate" DECIMAL(5,2) NOT NULL,
    "commissionAmount" DECIMAL(12,2) NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "CommissionStatus" NOT NULL DEFAULT 'PENDING',
    "paidDate" TIMESTAMP(3),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Commission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ReinsuranceTreaty" (
    "id" TEXT NOT NULL,
    "treatyNumber" TEXT NOT NULL,
    "reinsurerName" TEXT NOT NULL,
    "corporateId" TEXT,
    "treatyType" "TreatyType" NOT NULL,
    "sharePercentage" DECIMAL(5,2),
    "limitAmount" DECIMAL(14,2),
    "effectiveFrom" TIMESTAMP(3) NOT NULL,
    "effectiveTo" TIMESTAMP(3),
    "status" "TreatyStatus" NOT NULL DEFAULT 'ACTIVE',
    "premiumCeded" DECIMAL(12,2),
    "claimsRecovered" DECIMAL(12,2),
    "notes" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ReinsuranceTreaty_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdminUser" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "AdminRole" NOT NULL DEFAULT 'OPERATOR',
    "status" "AdminUserStatus" NOT NULL DEFAULT 'ACTIVE',
    "phone" TEXT,
    "department" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "AdminUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SystemSetting" (
    "id" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,
    "category" TEXT NOT NULL DEFAULT 'general',
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SystemSetting_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Claim_claimNumber_key" ON "Claim"("claimNumber");

-- CreateIndex
CREATE INDEX "Claim_memberId_idx" ON "Claim"("memberId");

-- CreateIndex
CREATE INDEX "Claim_status_idx" ON "Claim"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Preauthorization_preauthNumber_key" ON "Preauthorization"("preauthNumber");

-- CreateIndex
CREATE INDEX "Preauthorization_memberId_idx" ON "Preauthorization"("memberId");

-- CreateIndex
CREATE INDEX "Preauthorization_status_idx" ON "Preauthorization"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Premium_referenceNumber_key" ON "Premium"("referenceNumber");

-- CreateIndex
CREATE INDEX "Premium_corporateId_idx" ON "Premium"("corporateId");

-- CreateIndex
CREATE INDEX "Premium_memberId_idx" ON "Premium"("memberId");

-- CreateIndex
CREATE INDEX "Premium_status_idx" ON "Premium"("status");

-- CreateIndex
CREATE UNIQUE INDEX "Commission_referenceNumber_key" ON "Commission"("referenceNumber");

-- CreateIndex
CREATE INDEX "Commission_corporateId_idx" ON "Commission"("corporateId");

-- CreateIndex
CREATE INDEX "Commission_status_idx" ON "Commission"("status");

-- CreateIndex
CREATE UNIQUE INDEX "ReinsuranceTreaty_treatyNumber_key" ON "ReinsuranceTreaty"("treatyNumber");

-- CreateIndex
CREATE INDEX "ReinsuranceTreaty_corporateId_idx" ON "ReinsuranceTreaty"("corporateId");

-- CreateIndex
CREATE INDEX "ReinsuranceTreaty_status_idx" ON "ReinsuranceTreaty"("status");

-- CreateIndex
CREATE UNIQUE INDEX "AdminUser_email_key" ON "AdminUser"("email");

-- CreateIndex
CREATE UNIQUE INDEX "SystemSetting_key_key" ON "SystemSetting"("key");

-- CreateIndex
CREATE INDEX "SystemSetting_category_idx" ON "SystemSetting"("category");

-- AddForeignKey
ALTER TABLE "Claim" ADD CONSTRAINT "Claim_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Preauthorization" ADD CONSTRAINT "Preauthorization_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Premium" ADD CONSTRAINT "Premium_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "Corporate"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Premium" ADD CONSTRAINT "Premium_memberId_fkey" FOREIGN KEY ("memberId") REFERENCES "Member"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Commission" ADD CONSTRAINT "Commission_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "Corporate"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ReinsuranceTreaty" ADD CONSTRAINT "ReinsuranceTreaty_corporateId_fkey" FOREIGN KEY ("corporateId") REFERENCES "Corporate"("id") ON DELETE SET NULL ON UPDATE CASCADE;
