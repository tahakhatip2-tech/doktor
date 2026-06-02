-- Allow patients to comment on offers (news feed)
ALTER TABLE "OfferComment" ALTER COLUMN "userId" DROP NOT NULL;

ALTER TABLE "OfferComment" ADD COLUMN "patientId" INTEGER;

CREATE INDEX "OfferComment_patientId_idx" ON "OfferComment"("patientId");

ALTER TABLE "OfferComment" ADD CONSTRAINT "OfferComment_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE;
