import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

export async function GET(request: Request) {
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

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    
    if (!userId || userId !== decoded.userId) {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    const swapRequests = await prisma.swapRequest.findMany({
      where: {
        OR: [
          { senderId: userId },
          { receiverId: userId }
        ]
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            email: true,
          }
        },
        senderItem: {
          select: {
            id: true,
            title: true,
            pointValue: true,
            images: true,
          }
        },
        receiverItem: {
          select: {
            id: true,
            title: true,
            pointValue: true,
            images: true,
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
    });

    // Transform the data to match the frontend interface
    const transformedSwaps = swapRequests.map((swap: any) => {
      const isIncoming = swap.receiverId === userId;
      const otherUser = isIncoming ? swap.sender : swap.receiver;
      
      return {
        id: swap.id,
        status: swap.status.toLowerCase(),
        type: isIncoming ? 'incoming' : 'outgoing',
        createdAt: swap.createdAt.toISOString(),
        offeredItem: swap.senderItem ? {
          id: swap.senderItem.id,
          title: swap.senderItem.title,
          points: swap.senderItem.pointValue,
          imageUrl: swap.senderItem.images?.[0] || undefined,
        } : {
          id: 'points',
          title: `${swap.pointsOffered || 0} Points`,
          points: swap.pointsOffered || 0,
        },
        requestedItem: swap.receiverItem ? {
          id: swap.receiverItem.id,
          title: swap.receiverItem.title,
          points: swap.receiverItem.pointValue,
          imageUrl: swap.receiverItem.images?.[0] || undefined,
        } : {
          id: 'points',
          title: `${swap.pointsOffered || 0} Points`,
          points: swap.pointsOffered || 0,
        },
        otherUser: {
          id: otherUser?.id || '',
          name: otherUser?.name || 'Anonymous',
          rating: 4.5, // TODO: Calculate real rating from reviews
        },
        message: swap.message || undefined,
        lastActivity: swap.updatedAt.toISOString(),
      };
    });

    return NextResponse.json({ swaps: transformedSwaps });
  } catch (error) {
    console.error("Failed to fetch swap requests:", error);
    return NextResponse.json(
      { error: "Failed to fetch swap requests" },
      { status: 500 }
    );
  }
}
