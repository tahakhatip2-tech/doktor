const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const appointment = await prisma.appointment.findUnique({
    where: { id: 101 },
    include: {
      user: {
        select: { id: true, name: true, clinic_name: true }
      }
    }
  });
  console.log("Appointment 101:", JSON.stringify(appointment, null, 2));

  if (appointment && appointment.user) {
    const setting = await prisma.setting.findFirst({
        where: { userId: appointment.user.id, key: 'clinic_name' }
    });
    console.log("Setting for user", appointment.user.id, ":", setting);
  }
}

main().catch(e => console.error(e)).finally(() => prisma.$disconnect());
