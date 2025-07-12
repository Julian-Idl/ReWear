import { NextRequest, NextResponse } from "next/server";
import { verifyToken, getTokenFromHeader } from "@/lib/jwt";
import { prisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
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

    const { action } = await request.json(); // 'accept', 'reject', 'complete'
    const swapRequestId = params.id;

    // Get the swap request
    const swapRequest = await prisma.swapRequest.findUnique({
      where: { id: swapRequestId },
      include: {
        sender: true,
        receiver: true,
        senderItem: true,
        receiverItem: true
      }
    });

    if (!swapRequest) {
      return NextResponse.json({ error: "Swap request not found" }, { status: 404 });
    }

    // Check if user is authorized (only receiver can accept/reject, only participants can complete)
    if (action === 'accept' || action === 'reject') {
      if (swapRequest.receiverId !== decoded.userId) {
        return NextResponse.json({ 
          error: "Only the item owner can accept or reject swap requests" 
        }, { status: 403 });
      }
    } else if (action === 'complete') {
      if (swapRequest.senderId !== decoded.userId && swapRequest.receiverId !== decoded.userId) {
        return NextResponse.json({ 
          error: "Only swap participants can mark as complete" 
        }, { status: 403 });
      }
    }

    // Check current status
    if (swapRequest.status !== 'PENDING' && action !== 'complete') {
      return NextResponse.json({ 
        error: "This swap request has already been processed" 
      }, { status: 400 });
    }

    let updatedSwap;

    if (action === 'accept') {
      updatedSwap = await prisma.swapRequest.update({
        where: { id: swapRequestId },
        data: { status: 'ACCEPTED' }
      });

      // TODO: Add notification logic here

    } else if (action === 'reject') {
      updatedSwap = await prisma.swapRequest.update({
        where: { id: swapRequestId },
        data: { status: 'REJECTED' }
      });

    } else if (action === 'complete') {
      if (swapRequest.status !== 'ACCEPTED') {
        return NextResponse.json({ 
          error: "Can only complete accepted swap requests" 
        }, { status: 400 });
      }

      // Use transaction to handle point transfers and item updates
      await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // Update swap request status
        updatedSwap = await tx.swapRequest.update({
          where: { id: swapRequestId },
          data: { status: 'COMPLETED' }
        });

        // Handle point transactions for points-based swaps
        if (swapRequest.type === 'POINTS' && swapRequest.receiverItem) {
          const pointsToTransfer = swapRequest.receiverItem.pointValue;

          // Deduct points from sender
          await tx.user.update({
            where: { id: swapRequest.senderId },
            data: { 
              points: { 
                decrement: pointsToTransfer 
              } 
            }
          });

          // Add points to receiver (item owner)
          await tx.user.update({
            where: { id: swapRequest.receiverId },
            data: { 
              points: { 
                increment: pointsToTransfer 
              } 
            }
          });

          // Create point transaction records
          await tx.pointTransaction.createMany({
            data: [
              {
                userId: swapRequest.senderId,
                itemId: swapRequest.receiverItem.id,
                amount: -pointsToTransfer,
                type: 'SPENT_REDEMPTION',
                description: `Points spent redeeming "${swapRequest.receiverItem.title}"`
              },
              {
                userId: swapRequest.receiverId,
                itemId: swapRequest.receiverItem.id,
                amount: pointsToTransfer,
                type: 'EARNED_SWAP',
                description: `Points earned from "${swapRequest.receiverItem.title}" swap`
              }
            ]
          });
        }

        // Mark items as no longer available
        if (swapRequest.senderItem) {
          await tx.item.update({
            where: { id: swapRequest.senderItem.id },
            data: { 
              available: false,
              status: 'SOLD'
            }
          });
        }

        if (swapRequest.receiverItem) {
          await tx.item.update({
            where: { id: swapRequest.receiverItem.id },
            data: { 
              available: false,
              status: 'SOLD'
            }
          });
        }
      });
    } else {
      return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

    return NextResponse.json({ 
      success: true,
      swapRequest: updatedSwap,
      message: `Swap request ${action}ed successfully`
    });

  } catch (error) {
    console.error(`Failed to process swap request:`, error);
    return NextResponse.json(
      { error: `Failed to process swap request` },
      { status: 500 }
    );
  }
}
