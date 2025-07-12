import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'MODERATOR')) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const pendingItems = await prisma.item.findMany({
      where: { status: 'PENDING' },
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
      take: 10, // Limit to 10 most recent
    });

    return NextResponse.json({ pendingItems });
  } catch (error) {
    console.error("Failed to fetch pending items:", error);
    return NextResponse.json(
      { error: "Failed to fetch pending items" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    
    if (!token) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded || (decoded.role !== 'ADMIN' && decoded.role !== 'MODERATOR')) {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }

    const body = await request.json();
    const { itemId, action } = body; // action: 'approve' or 'reject'

    if (!itemId || !action) {
      return NextResponse.json({ error: "Missing itemId or action" }, { status: 400 });
    }

    const newStatus = action === 'approve' ? 'APPROVED' : 'REJECTED';
    const available = action === 'approve';

    const updatedItem = await prisma.item.update({
      where: { id: itemId },
      data: { 
        status: newStatus,
        available
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

    return NextResponse.json({ item: updatedItem });
  } catch (error) {
    console.error("Failed to update item status:", error);
    return NextResponse.json(
      { error: "Failed to update item" },
      { status: 500 }
    );
  }
}
