import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
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
    const { receiverItemId, senderItemId, type, message } = body;

    // Validate required fields
    if (!receiverItemId || !type) {
      return NextResponse.json({ 
        error: "Missing required fields: receiverItemId and type are required" 
      }, { status: 400 });
    }

    // Get the receiver item to find the owner
    const receiverItem = await prisma.item.findUnique({
      where: { id: receiverItemId },
      include: { user: true }
    });

    if (!receiverItem) {
      return NextResponse.json({ error: "Item not found" }, { status: 404 });
    }

    // Check if the user is trying to swap with their own item
    if (receiverItem.userId === decoded.userId) {
      return NextResponse.json({ 
        error: "You cannot create a swap request for your own item" 
      }, { status: 400 });
    }

    // Check if item is available
    if (!receiverItem.available || receiverItem.status !== 'APPROVED') {
      return NextResponse.json({ 
        error: "This item is not available for swap" 
      }, { status: 400 });
    }

    let swapData: any = {
      senderId: decoded.userId,
      receiverId: receiverItem.userId,
      type: type.toUpperCase(),
      status: 'PENDING',
      message: message || null
    };

    if (type === 'DIRECT') {
      // For direct swaps, we need a sender item
      if (!senderItemId) {
        return NextResponse.json({ 
          error: "Sender item is required for direct swaps" 
        }, { status: 400 });
      }

      // Verify the sender owns the sender item
      const senderItem = await prisma.item.findUnique({
        where: { id: senderItemId }
      });

      if (!senderItem || senderItem.userId !== decoded.userId) {
        return NextResponse.json({ 
          error: "Invalid sender item" 
        }, { status: 400 });
      }

      if (!senderItem.available || senderItem.status !== 'APPROVED') {
        return NextResponse.json({ 
          error: "Your item is not available for swap" 
        }, { status: 400 });
      }

      swapData.senderItemId = senderItemId;
      swapData.receiverItemId = receiverItemId;
    } else if (type === 'POINTS') {
      // For points-based redemption, check if user has enough points
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId }
      });

      if (!user || user.points < receiverItem.pointValue) {
        return NextResponse.json({ 
          error: "Insufficient points for this item" 
        }, { status: 400 });
      }

      // For points redemption, we don't need a physical sender item
      // The swap request will reference the points directly
      swapData.senderItemId = null; // No physical item for points
      swapData.receiverItemId = receiverItemId;
    }

    // Check for existing pending swap request
    const existingSwap = await prisma.swapRequest.findFirst({
      where: {
        senderId: decoded.userId,
        receiverId: receiverItem.userId,
        receiverItemId: receiverItemId,
        status: 'PENDING'
      }
    });

    if (existingSwap) {
      return NextResponse.json({ 
        error: "You already have a pending swap request for this item" 
      }, { status: 400 });
    }

    // Create the swap request
    const swapRequest = await prisma.swapRequest.create({
      data: swapData,
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
      }
    });

    return NextResponse.json({ 
      success: true, 
      swapRequest,
      message: "Swap request created successfully" 
    });

  } catch (error) {
    console.error("Failed to create swap request:", error);
    return NextResponse.json(
      { error: "Failed to create swap request" },
      { status: 500 }
    );
  }
}
