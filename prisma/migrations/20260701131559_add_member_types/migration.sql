-- CreateEnum
CREATE TYPE "MemberType" AS ENUM ('PRINCIPAL', 'DEPENDANT');

-- AlterTable
ALTER TABLE "Member" ADD COLUMN     "memberType" "MemberType" NOT NULL DEFAULT 'PRINCIPAL',
ADD COLUMN     "principalId" TEXT;

-- CreateIndex
CREATE INDEX "Member_principalId_idx" ON "Member"("principalId");

-- CreateIndex
CREATE INDEX "Member_memberType_idx" ON "Member"("memberType");

-- AddForeignKey
ALTER TABLE "Member" ADD CONSTRAINT "Member_principalId_fkey" FOREIGN KEY ("principalId") REFERENCES "Member"("id") ON DELETE CASCADE ON UPDATE CASCADE;
