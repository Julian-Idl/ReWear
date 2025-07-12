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

    // Get admin statistics
    const [
      totalUsers,
      totalItems,
      pendingItems,
      activeSwaps,
      totalTransactions,
      flaggedItems
    ] = await Promise.all([
      prisma.user.count(),
      prisma.item.count({ where: { status: 'APPROVED' } }),
      prisma.item.count({ where: { status: 'PENDING' } }),
      prisma.swapRequest.count({ 
        where: { 
          status: { 
            in: ['PENDING', 'ACCEPTED'] 
          } 
        } 
      }),
      prisma.swapRequest.count({ where: { status: 'COMPLETED' } }),
      prisma.item.count({ where: { status: 'REJECTED' } })
    ]);

    const stats = {
      totalUsers,
      totalItems,
      pendingItems,
      activeSwaps,
      totalTransactions,
      flaggedItems
    };

    return NextResponse.json({ stats });
  } catch (error) {
    console.error("Failed to fetch admin stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch statistics" },
      { status: 500 }
    );
  }
}
