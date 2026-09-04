const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const offers = await prisma.offer.findMany();
  console.log('Total offers:', offers.length);
  const activeOffers = await prisma.offer.findMany({
    where: {
      isActive: true,
      OR: [
        { isPermanent: true },
        { endDate: { gte: new Date() }, startDate: { lte: new Date() } },
      ],
    }
  });
  console.log('Active offers:', activeOffers.length);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
