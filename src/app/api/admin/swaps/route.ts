import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request: NextRequest) {
  try {
    const token = request.headers.get('authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return NextResponse.json({ message: 'No token provided' }, { status: 401 });
    }

    // Verify JWT token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
    
    // Check if user is admin or moderator
    if (decoded.role !== 'ADMIN' && decoded.role !== 'MODERATOR') {
      return NextResponse.json({ message: 'Unauthorized' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const type = searchParams.get('type');

    // Build where clause
    const where: any = {};
    if (status && status !== 'all') {
      where.status = status;
    }
    if (type && type !== 'all') {
      where.type = type;
    }

    // Fetch swap requests with related data
    const swaps = await prisma.swapRequest.findMany({
      where,
      include: {
        sender: {
          select: {
            name: true,
            email: true,
          },
        },
        receiver: {
          select: {
            name: true,
            email: true,
          },
        },
        senderItem: {
          select: {
            title: true,
            pointValue: true,
          },
        },
        receiverItem: {
          select: {
            title: true,
            pointValue: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json({ swaps });
  } catch (error) {
    console.error('Failed to fetch swaps:', error);
    if (error instanceof jwt.JsonWebTokenError) {
      return NextResponse.json({ message: 'Invalid token' }, { status: 401 });
    }
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
