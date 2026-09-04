const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  try {
    const patientId = 1; // dummy patient id
    const now = new Date();
    const offers = await prisma.offer.findMany({
      where: {
        isActive: true,
        OR: [
            { isPermanent: true },
            { endDate: { gte: now }, startDate: { lte: now } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
          user: { 
              select: { 
                  id: true, 
                  name: true, 
                  clinic_name: true, 
                  avatar: true, 
                  clinic_specialty: true, 
                  phone: true,
              } 
          },
          likes: true,
          comments: {
              include: {
                  user: { select: { id: true, name: true, avatar: true } },
                  patient: { select: { id: true, fullName: true, avatar: true } }
              },
              orderBy: { createdAt: 'asc' }
          },
      }
    });
    console.log('Returned offers count:', offers.length);
  } catch(e) {
    console.error(e);
  }
}

main().finally(() => prisma.$disconnect());
