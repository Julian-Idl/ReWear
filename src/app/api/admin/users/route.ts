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

    const users = await prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        points: true,
        verified: true,
        active: true,
        createdAt: true,
        _count: {
          select: {
            items: true,
            sentRequests: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ users });
  } catch (error) {
    console.error("Failed to fetch users:", error);
    return NextResponse.json(
      { error: "Failed to fetch users" },
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
    if (!decoded || decoded.role !== 'ADMIN') {
      return NextResponse.json({ error: "Access denied - Admin only" }, { status: 403 });
    }

    const body = await request.json();
    const { userId, action } = body;

    if (!userId || !action) {
      return NextResponse.json({ error: "Missing userId or action" }, { status: 400 });
    }

    let updateData: any = {};

    switch (action) {
      case 'suspend':
        updateData.active = false;
        break;
      case 'activate':
        updateData.active = true;
        break;
      case 'promote':
        updateData.role = 'MODERATOR';
        break;
      case 'demote':
        updateData.role = 'USER';
        break;
      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        active: true,
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error) {
    console.error("Failed to update user:", error);
    return NextResponse.json(
      { error: "Failed to update user" },
      { status: 500 }
    );
  }
}
