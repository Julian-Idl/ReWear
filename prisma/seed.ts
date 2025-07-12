import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting database seeding...');

  try {
    // Create admin user
    const adminPassword = await hash('admin123', 12);
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

    console.log('✅ Admin user created:', admin.email);

    // Create test users
    const testUsers = [
      {
        email: 'alice@example.com',
        name: 'Alice Johnson',
        bio: 'Fashion enthusiast and sustainability advocate',
        points: 250,
      },
      {
        email: 'bob@example.com',
        name: 'Bob Smith',
        bio: 'Vintage clothing collector',
        points: 180,
      },
      {
        email: 'carol@example.com',
        name: 'Carol Davis',
        bio: 'Designer looking for unique pieces',
        points: 320,
      },
    ];

    for (const userData of testUsers) {
      const password = await hash('password123', 12);
      const user = await prisma.user.upsert({
        where: { email: userData.email },
        update: {},
        create: {
          ...userData,
          password,
          verified: true,
        },
      });
      console.log('✅ Test user created:', user.email);
    }

    // Create sample categories
    const categories = [
      { name: 'Tops', description: 'T-shirts, blouses, shirts, and sweaters' },
      { name: 'Bottoms', description: 'Pants, jeans, skirts, and shorts' },
      { name: 'Dresses', description: 'Casual and formal dresses' },
      { name: 'Outerwear', description: 'Jackets, coats, and blazers' },
      { name: 'Shoes', description: 'Sneakers, boots, heels, and flats' },
      { name: 'Accessories', description: 'Scarves, belts, hats, and jewelry' },
    ];

    for (const category of categories) {
      await prisma.itemCategory.upsert({
        where: { name: category.name },
        update: {},
        create: category,
      });
    }

    console.log('✅ Categories created');

    // Get all users for creating sample items
    const users = await prisma.user.findMany();

    // Create sample items
    const sampleItems = [
      {
        title: 'Vintage Levi\'s Denim Jacket',
        description: 'Classic denim jacket in excellent condition. Size Medium. Perfect for casual outfits.',
        category: 'OUTERWEAR',
        brand: 'Levi\'s',
        size: 'M',
        condition: 'EXCELLENT',
        color: 'Blue',
        material: 'Denim',
        tags: ['vintage', 'classic', 'casual'],
        pointValue: 120,
        images: ['/placeholder-jacket.jpg'],
      },
      {
        title: 'Black Silk Evening Dress',
        description: 'Elegant black silk dress perfect for formal events. Worn only once.',
        category: 'DRESSES',
        brand: 'Zara',
        size: 'S',
        condition: 'VERY_GOOD',
        color: 'Black',
        material: 'Silk',
        tags: ['formal', 'elegant', 'evening'],
        pointValue: 150,
        images: ['/placeholder-dress.jpg'],
      },
      {
        title: 'White Nike Air Force 1',
        description: 'Classic white sneakers in good condition. Some signs of wear but still plenty of life left.',
        category: 'SHOES',
        brand: 'Nike',
        size: '9',
        condition: 'GOOD',
        color: 'White',
        material: 'Leather',
        tags: ['sneakers', 'casual', 'white'],
        pointValue: 80,
        images: ['/placeholder-shoes.jpg'],
      },
      {
        title: 'Cashmere Wool Scarf',
        description: 'Luxury cashmere scarf in perfect condition. Beautiful pattern and incredibly soft.',
        category: 'ACCESSORIES',
        brand: 'Burberry',
        size: 'One Size',
        condition: 'EXCELLENT',
        color: 'Beige',
        material: 'Cashmere',
        tags: ['luxury', 'warm', 'designer'],
        pointValue: 200,
        images: ['/placeholder-scarf.jpg'],
      },
    ];

    for (let i = 0; i < sampleItems.length; i++) {
      const item = sampleItems[i];
      const user = users[i % users.length]; // Rotate through users

      await prisma.item.create({
        data: {
          ...item,
          userId: user.id,
          status: 'APPROVED',
          available: true,
        },
      });
    }

    console.log('✅ Sample items created');

    // Create some point transactions
    for (const user of users.slice(1)) { // Skip admin
      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          amount: 100,
          type: 'BONUS',
          description: 'Welcome bonus points',
        },
      });

      await prisma.pointTransaction.create({
        data: {
          userId: user.id,
          amount: 50,
          type: 'EARNED_LISTING',
          description: 'Points earned for listing an item',
        },
      });
    }

    console.log('✅ Point transactions created');

    console.log('🎉 Database seeding completed successfully!');
    console.log('');
    console.log('Test accounts:');
    console.log('- Admin: admin@rewear.com / admin123');
    console.log('- User 1: alice@example.com / password123');
    console.log('- User 2: bob@example.com / password123');
    console.log('- User 3: carol@example.com / password123');

  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
