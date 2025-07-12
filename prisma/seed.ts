import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await hash('Admin@123!', 12);
    const admin = await prisma.user.upsert({
      where: { email: 'admin@rewear.com' },
      update: {},
      create: {
        email: 'admin@rewear.com',
        password: adminPassword,
        name: 'Admin User',
        role: 'ADMIN',
        points: 1000,
        verified: true,
        bio: 'Platform administrator',
      },
    });

    // Create moderator user
    const moderatorPassword = await hash('Moderator@123!', 12);
    const moderator = await prisma.user.upsert({
      where: { email: 'moderator@rewear.com' },
      update: {},
      create: {
        email: 'moderator@rewear.com',
        password: moderatorPassword,
        name: 'Moderator User',
        role: 'MODERATOR',
        points: 500,
        verified: true,
        bio: 'Platform moderator',
      },
    });

    console.log('✅ Admin user created:', admin.email);
    console.log('✅ Moderator user created:', moderator.email);

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('- Admin:     admin@rewear.com     / Admin@123!');
    console.log('- Moderator: moderator@rewear.com / Moderator@123!');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
