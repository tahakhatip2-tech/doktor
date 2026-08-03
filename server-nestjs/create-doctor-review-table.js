const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    await prisma.$executeRawUnsafe(`
        CREATE TABLE IF NOT EXISTS "DoctorReview" (
            "id" SERIAL PRIMARY KEY,
            "clinicDoctorId" INTEGER NOT NULL,
            "patientId" INTEGER NOT NULL,
            "rating" INTEGER NOT NULL,
            "comment" TEXT,
            "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "DoctorReview_dup" UNIQUE ("clinicDoctorId", "patientId"),
            CONSTRAINT "DoctorReview_doctor" FOREIGN KEY ("clinicDoctorId") REFERENCES "ClinicDoctor"("id") ON DELETE CASCADE ON UPDATE CASCADE,
            CONSTRAINT "DoctorReview_patient" FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE
        );
    `);
    console.log('DoctorReview table created successfully!');
}

main().catch(e => console.error('Error:', e.message)).finally(() => prisma.$disconnect());
