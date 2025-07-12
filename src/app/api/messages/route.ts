import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = getTokenFromHeader(authHeader || undefined);
    
    if (!token) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 });
    }

    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: "Invalid or expired token" }, { status: 401 });
    }

    const body = await request.json();
    const { receiverId, content, swapRequestId } = body;

    // Validate required fields
    if (!receiverId || !content) {
      return NextResponse.json({ 
        error: "Missing required fields: receiverId and content are required" 
      }, { status: 400 });
    }

    // Check if the receiver exists
    const receiver = await prisma.user.findUnique({
      where: { id: receiverId }
    });

    if (!receiver) {
      return NextResponse.json({ error: "Receiver not found" }, { status: 404 });
    }

    // Check if user is trying to message themselves
    if (receiverId === decoded.userId) {
      return NextResponse.json({ 
        error: "You cannot send a message to yourself" 
      }, { status: 400 });
    }

    // If swapRequestId is provided, verify it exists and user is involved
    if (swapRequestId) {
      const swapRequest = await prisma.swapRequest.findUnique({
        where: { id: swapRequestId }
      });

      if (!swapRequest) {
        return NextResponse.json({ error: "Swap request not found" }, { status: 404 });
      }

      if (swapRequest.senderId !== decoded.userId && swapRequest.receiverId !== decoded.userId) {
        return NextResponse.json({ 
          error: "You are not authorized to message in this swap request" 
        }, { status: 403 });
      }
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        content,
        senderId: decoded.userId,
        receiverId,
        swapRequestId: swapRequestId || null,
        read: false
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      }
    });

    return NextResponse.json({ 
      success: true, 
      message,
      messageText: "Message sent successfully" 
    });

  } catch (error) {
    console.error("Failed to send message:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
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
    const conversationWith = searchParams.get('conversationWith');
    const swapRequestId = searchParams.get('swapRequestId');

    let whereClause: any = {
      OR: [
        { senderId: decoded.userId },
        { receiverId: decoded.userId }
      ]
    };

    if (conversationWith) {
      whereClause.OR = [
        { senderId: decoded.userId, receiverId: conversationWith },
        { senderId: conversationWith, receiverId: decoded.userId }
      ];
    }

    if (swapRequestId) {
      whereClause.swapRequestId = swapRequestId;
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        },
        receiver: {
          select: {
            id: true,
            name: true,
            avatar: true,
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    });

    return NextResponse.json({ messages });

  } catch (error) {
    console.error("Failed to fetch messages:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}
