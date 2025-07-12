import { PrismaClient, Category, Condition, ItemStatus } from '@prisma/client';
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

    // Create some sample items for testing
    const sampleItems = [
      {
        title: "Vintage Denim Jacket",
        description: "Classic vintage denim jacket in excellent condition. Perfect for layering and adding a retro touch to any outfit.",
        images: ["https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop"],
        category: Category.OUTERWEAR,
        brand: "Levi's",
        size: "M",
        condition: Condition.EXCELLENT,
        color: "Blue",
        material: "Denim",
        tags: ["vintage", "casual", "denim"],
        pointValue: 45,
        userId: admin.id,
        status: ItemStatus.APPROVED,
        available: true,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), // 2 days ago
      },
      {
        title: "Summer Floral Dress",
        description: "Beautiful floral summer dress, lightweight and perfect for warm weather. Great for casual outings or garden parties.",
        images: ["https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop"],
        category: Category.DRESSES,
        brand: "Zara",
        size: "S",
        condition: Condition.GOOD,
        color: "Multicolor",
        material: "Cotton",
        tags: ["summer", "floral", "casual"],
        pointValue: 35,
        userId: moderator.id,
        status: ItemStatus.APPROVED,
        available: true,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000), // 1 day ago
      },
      {
        title: "Designer High Heels",
        description: "Elegant black designer high heels, barely worn. Perfect for formal events and special occasions.",
        images: ["https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400&h=400&fit=crop"],
        category: Category.SHOES,
        brand: "Christian Louboutin",
        size: "7",
        condition: Condition.EXCELLENT,
        color: "Black",
        material: "Leather",
        tags: ["designer", "formal", "heels"],
        pointValue: 85,
        userId: admin.id,
        status: ItemStatus.APPROVED,
        available: true,
        createdAt: new Date(), // Today
      },
      {
        title: "Cozy Wool Sweater",
        description: "Soft and warm wool sweater, perfect for cooler weather. Has been well-maintained and is very comfortable.",
        images: ["https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400&h=400&fit=crop"],
        category: Category.TOPS,
        brand: "H&M",
        size: "L",
        condition: Condition.GOOD,
        color: "Gray",
        material: "Wool",
        tags: ["cozy", "warm", "casual"],
        pointValue: 25,
        userId: moderator.id,
        status: ItemStatus.APPROVED,
        available: true,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      },
      {
        title: "Athletic Running Shoes",
        description: "High-performance running shoes with excellent cushioning. Great for workouts and daily runs.",
        images: ["https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400&h=400&fit=crop"],
        category: Category.SHOES,
        brand: "Nike",
        size: "9",
        condition: Condition.EXCELLENT,
        color: "White",
        material: "Synthetic",
        tags: ["athletic", "running", "sports"],
        pointValue: 40,
        userId: admin.id,
        status: ItemStatus.APPROVED,
        available: true,
        createdAt: new Date(), // Today
      }
    ];

    for (const itemData of sampleItems) {
      await prisma.item.create({
        data: itemData,
      });
    }

    console.log('✅ Sample items created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('🔑 Login Credentials:');
    console.log('- Admin:     admin@rewear.com     / Admin@123!');
    console.log('- Moderator: moderator@rewear.com / Moderator@123!');
    console.log('');
    console.log('📦 Sample items have been added to test the browse functionality');

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
