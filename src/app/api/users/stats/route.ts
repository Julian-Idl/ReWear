import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId) {
      return NextResponse.json({ error: "User ID required" }, { status: 400 });
    }

    // Get user stats
    const [
      totalItems,
      activeSwaps,
      completedSwaps,
      user
    ] = await Promise.all([
      prisma.item.count({
        where: {
          userId: userId,
          status: { in: ['APPROVED', 'PENDING'] }
        }
      }),
      prisma.swapRequest.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ],
          status: { in: ['PENDING', 'ACCEPTED'] }
        }
      }),
      prisma.swapRequest.count({
        where: {
          OR: [
            { senderId: userId },
            { receiverId: userId }
          ],
          status: 'COMPLETED'
        }
      }),
      prisma.user.findUnique({
        where: { id: userId },
        select: { points: true }
      })
    ]);

    return NextResponse.json({
      stats: {
        totalItems,
        activeSwaps,
        totalPoints: user?.points || 0,
        completedSwaps
      }
    });
  } catch (error) {
    console.error("Failed to fetch user stats:", error);
    return NextResponse.json(
      { error: "Failed to fetch stats" },
      { status: 500 }
    );
  }
}
