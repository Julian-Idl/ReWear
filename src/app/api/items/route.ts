import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    const items = await prisma.item.findMany({
      where: {
        userId: userId,
      },
      include: {
        user: {
          select: {
            name: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to fetch user items:", error);
    return NextResponse.json(
      { error: "Failed to fetch items" },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
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
      tags,
      pointValue
    } = body;

    // Validate required fields
    if (!title || !description || !category || !size || !condition) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    console.log('💡 Creating item with status:', process.env.NODE_ENV === 'development' ? 'APPROVED' : 'PENDING');

    const item = await prisma.item.create({
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
        tags: tags || [],
        pointValue: pointValue || 50,
        userId: decoded.userId,
        status: process.env.NODE_ENV === 'development' ? 'APPROVED' : 'PENDING', // Auto-approve in development
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

    console.log('✅ Item created:', {
      id: item.id,
      title: item.title,
      status: item.status,
      userId: item.userId
    });

    return NextResponse.json({ item }, { status: 201 });
  } catch (error) {
    console.error("Failed to create item:", error);
    return NextResponse.json(
      { error: "Failed to create item" },
      { status: 500 }
    );
  }
}
