import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get('category');
    const condition = searchParams.get('condition');
    const size = searchParams.get('size');
    const search = searchParams.get('search');

    // Build where clause for filtering
    const where: any = {
      status: 'APPROVED', // Only show approved items
      available: true,    // Only show available items
    };

    if (category && category !== 'All') {
      where.category = category.toUpperCase();
    }

    if (condition && condition !== 'All') {
      where.condition = condition.toUpperCase();
    }

    if (size && size !== 'All') {
      where.size = size;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
        { brand: { contains: search, mode: 'insensitive' } },
      ];
    }

    const items = await prisma.item.findMany({
      where,
      include: {
        user: {
          select: {
            name: true,
            id: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Transform the data to match the frontend interface
    const transformedItems = items.map((item: any) => ({
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition,
      size: item.size,
      points: item.pointValue,
      imageUrl: item.images?.[0] || undefined,
      user: {
        name: item.user.name || 'Anonymous',
        rating: 4.5, // TODO: Calculate real rating from reviews
      },
      createdAt: item.createdAt.toISOString().split('T')[0],
      isLiked: false, // TODO: Check if current user has liked this item
    }));

    return NextResponse.json({ items: transformedItems });
  } catch (error) {
    console.error("Failed to fetch browse items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}
