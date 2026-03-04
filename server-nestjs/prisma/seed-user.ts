import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('Creating test user...');

    const hashedPassword = await bcrypt.hash('123456', 10);

    const user = await prisma.user.upsert({
        where: { email: 'test@alkhatib.com' },
        update: {},
        create: {
            email: 'test@alkhatib.com',
            password: hashedPassword,
            name: 'Dr. Test User',
            role: 'ADMIN',
            subscriptionStatus: 'ACTIVE',
            planId: 1,
        },
    });

    console.log('✅ Test user created successfully!');
    console.log('📧 Email: test@alkhatib.com');
    console.log('🔑 Password: 123456');
    console.log('👤 User ID:', user.id);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
