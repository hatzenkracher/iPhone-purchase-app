import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
    console.log('🌱 Starting database seed...');

    // Create default admin user
    const hashedPassword = await bcrypt.hash('admin123', 10);

    const adminUser = await prisma.user.upsert({
        where: { username: 'admin' },
        update: {},
        create: {
            id: 'default-admin-user',
            username: 'admin',
            password: hashedPassword,
            name: 'Administrator',
            email: null,
        },
    });

    console.log('✅ Created admin user:', adminUser.username);
    console.log('   Default password: admin123');
    console.log('   ⚠️  IMPORTANT: Change this password after first login!');

    // Update all existing devices to belong to admin user
    const deviceCount = await prisma.device.count();
    if (deviceCount > 0) {
        await prisma.device.updateMany({
            where: { userId: null },
            data: { userId: adminUser.id },
        });
        console.log(`✅ Linked ${deviceCount} existing devices to admin user`);
    }

    // Update company settings if exists
    const settingsCount = await prisma.companySettings.count();
    if (settingsCount > 0) {
        await prisma.companySettings.updateMany({
            where: { userId: null },
            data: { userId: adminUser.id },
        });
        console.log(`✅ Linked ${settingsCount} company settings to admin user`);
    }

    console.log('🎉 Seed completed successfully!');
}

main()
    .catch((e) => {
        console.error('❌ Seed failed:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
