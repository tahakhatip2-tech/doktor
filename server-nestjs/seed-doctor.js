const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');

const prisma = new PrismaClient();

async function main() {
  const email = 'tahakhatip2@gmail.com';
  const password = await bcrypt.hash('taha@1982', 10);
  
  const user = await prisma.user.upsert({
    where: { email },
    update: {
      password,
      role: 'ADMIN', // assuming ADMIN/DOCTOR role
      status: 'active'
    },
    create: {
      email,
      password,
      name: 'د. طه الخطيب',
      role: 'ADMIN',
      status: 'active'
    }
  });

  console.log('✅ Doctor user updated/created:', user.email);
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
