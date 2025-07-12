import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authentication token to check ownership
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    let currentUserId: string | null = null;
    
    if (token) {
      const decoded = verifyToken(token);
      if (decoded) {
        currentUserId = decoded.userId;
      }
    }

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

    // Check if user can view this item
    const isOwner = currentUserId === item.userId;
    const isApproved = item.status === 'APPROVED';
    
    // Only show if approved OR if user is the owner
    if (!isApproved && !isOwner) {
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
      isOwner: isOwner,
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

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get authentication token
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 });
    }

    const body = await request.json();
    const {
      title,
      description,
      images,
      category,
      subcategory,
      brand,
      size,
      condition,
      color,
      material,
      pointValue
    } = body;

    // Check if item exists and user is the owner
    const existingItem = await prisma.item.findUnique({
      where: { id },
      select: { userId: true, status: true }
    });

    if (!existingItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    if (existingItem.userId !== decoded.userId) {
      return NextResponse.json({ error: "Not authorized to edit this item" }, { status: 403 });
    }

    // Validate required fields
    if (!title || !description || !category || !size || !condition) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log('✏️ Updating item:', id, 'by user:', decoded.userId);

    // Update the item
    const updatedItem = await prisma.item.update({
      where: { id },
      data: {
        title,
        description,
        images: images || [],
        category,
        subcategory,
        brand,
        size,
        condition,
        color,
        material,
        pointValue: pointValue || 50,
        // Reset to pending if significant changes are made (optional)
        // status: 'PENDING'
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
    });

    console.log('✅ Item updated successfully:', updatedItem.id);

    return NextResponse.json({
      message: "Item updated successfully",
      item: updatedItem
    });

  } catch (error) {
    console.error("Failed to update item:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}
