-- CreateTable
CREATE TABLE "Patient" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "avatar" TEXT,
    "dateOfBirth" TIMESTAMP(3),
    "gender" TEXT,
    "bloodType" TEXT,
    "allergies" TEXT,
    "chronicDiseases" TEXT,
    "emergencyContact" TEXT,
    "address" TEXT,
    "nationalId" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Patient_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PatientNotification" (
    "id" SERIAL NOT NULL,
    "patientId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "message" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "appointmentId" INTEGER,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "readAt" TIMESTAMP(3),

    CONSTRAINT "PatientNotification_pkey" PRIMARY KEY ("id")
);

-- AlterTable User - Add clinic fields
ALTER TABLE "User" ADD COLUMN "clinic_name" TEXT;
ALTER TABLE "User" ADD COLUMN "clinic_address" TEXT;
ALTER TABLE "User" ADD COLUMN "clinic_phone" TEXT;
ALTER TABLE "User" ADD COLUMN "clinic_specialty" TEXT;
ALTER TABLE "User" ADD COLUMN "working_hours" TEXT;
ALTER TABLE "User" ADD COLUMN "auto_reply_enabled" BOOLEAN NOT NULL DEFAULT false;
ALTER TABLE "User" ADD COLUMN "ai_api_key" TEXT;
ALTER TABLE "User" ADD COLUMN "ai_system_instruction" TEXT;

-- AlterTable Appointment - Add patient portal fields
ALTER TABLE "Appointment" ADD COLUMN "patientUserId" INTEGER;
ALTER TABLE "Appointment" ADD COLUMN "confirmedAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN "cancelledAt" TIMESTAMP(3);
ALTER TABLE "Appointment" ADD COLUMN "cancellationReason" TEXT;
ALTER TABLE "Appointment" ALTER COLUMN "status" SET DEFAULT 'pending';

-- CreateIndex
CREATE UNIQUE INDEX "Patient_email_key" ON "Patient"("email");
CREATE UNIQUE INDEX "Patient_phone_key" ON "Patient"("phone");
CREATE UNIQUE INDEX "Patient_nationalId_key" ON "Patient"("nationalId");

-- AddForeignKey
ALTER TABLE "Appointment" ADD CONSTRAINT "Appointment_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientNotification" ADD CONSTRAINT "PatientNotification_patientId_fkey" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PatientNotification" ADD CONSTRAINT "PatientNotification_appointmentId_fkey" FOREIGN KEY ("appointmentId") REFERENCES "Appointment"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey for MedicalRecord to Patient
ALTER TABLE "MedicalRecord" ADD COLUMN "patientUserId" INTEGER;
ALTER TABLE "MedicalRecord" ADD CONSTRAINT "MedicalRecord_patientUserId_fkey" FOREIGN KEY ("patientUserId") REFERENCES "Patient"("id") ON DELETE SET NULL ON UPDATE CASCADE;
