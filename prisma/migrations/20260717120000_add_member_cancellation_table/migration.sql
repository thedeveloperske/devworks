-- CreateTable
CREATE TABLE "member_cancellation" (
    "idx" SERIAL NOT NULL,
    "member_no" VARCHAR(20) NOT NULL,
    "cancelled" INTEGER NOT NULL,
    "date_can" DATE NOT NULL,
    "anniv" INTEGER,
    "reason" INTEGER,
    "user_id" VARCHAR(10),
    "date_entered" DATE,
    "sync" INTEGER,

    CONSTRAINT "member_cancellation_pkey" PRIMARY KEY ("idx")
);

-- CreateIndex
CREATE INDEX "member_cancellation_member_no_idx" ON "member_cancellation"("member_no");
