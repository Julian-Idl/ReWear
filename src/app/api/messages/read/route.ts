import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";

const prisma = new PrismaClient();

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

    const { senderId } = await request.json();

    if (!senderId) {
      return NextResponse.json({ error: "Sender ID is required" }, { status: 400 });
    }

    // Mark all messages from the sender to the current user as read
    await prisma.message.updateMany({
      where: {
        senderId: senderId,
        receiverId: decoded.userId,
        isRead: false,
      },
      data: {
        isRead: true,
      },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to mark messages as read:", error);
    return NextResponse.json(
      { error: "Failed to mark messages as read" },
      { status: 500 }
    );
  }
}
