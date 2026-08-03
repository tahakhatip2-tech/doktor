const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    console.log('Creating table DoctorReview...');
    await prisma.$executeRawUnsafe(`
      CREATE TABLE "DoctorReview" (
        "id" SERIAL NOT NULL,
        "clinicDoctorId" INTEGER NOT NULL,
        "patientId" INTEGER NOT NULL,
        "rating" INTEGER NOT NULL,
        "comment" TEXT,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "DoctorReview_pkey" PRIMARY KEY ("id")
      );
    `);
    
    console.log('Creating foreign key for clinicDoctorId...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "DoctorReview" 
      ADD CONSTRAINT "DoctorReview_clinicDoctorId_fkey" 
      FOREIGN KEY ("clinicDoctorId") REFERENCES "ClinicDoctor"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    console.log('Creating foreign key for patientId...');
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "DoctorReview" 
      ADD CONSTRAINT "DoctorReview_patientId_fkey" 
      FOREIGN KEY ("patientId") REFERENCES "Patient"("id") ON DELETE CASCADE ON UPDATE CASCADE;
    `);

    console.log('DoctorReview created successfully!');
  } catch (e) {
    console.error('Error:', e.message);
  } finally {
    await prisma.$disconnect();
  }
}

main();
