import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    const item = await prisma.item.findUnique({
      where: {
        id: id,
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true,
            createdAt: true,
            _count: {
              select: {
                items: true,
              },
            },
          },
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Only show approved items (unless it's the owner viewing)
    if (item.status !== 'APPROVED') {
      return NextResponse.json({ error: "Item not available" }, { status: 404 });
    }

    // Transform the data to match the frontend interface
    const transformedItem = {
      id: item.id,
      title: item.title,
      description: item.description,
      category: item.category,
      condition: item.condition,
      size: item.size,
      brand: item.brand,
      color: item.color,
      material: item.material,
      points: item.pointValue,
      images: item.images.length > 0 ? item.images : ["/api/placeholder/600/600"],
      user: {
        id: item.user.id,
        name: item.user.name || 'Anonymous',
        rating: 4.5, // TODO: Calculate real rating from reviews
        totalItems: item.user._count.items,
        joinedDate: item.user.createdAt.toISOString().split('T')[0],
      },
      createdAt: item.createdAt.toISOString().split('T')[0],
      isLiked: false, // TODO: Check if current user has liked this item
      isOwner: false, // TODO: Check if current user owns this item
      tags: item.tags,
      subcategory: item.subcategory,
      available: item.available,
      status: item.status,
    };

    return NextResponse.json({ item: transformedItem });
  } catch (error) {
    console.error("Failed to fetch item:", error);
    return NextResponse.json(
      { error: "Failed to fetch item" },
      { status: 500 }
    );
  }
}
