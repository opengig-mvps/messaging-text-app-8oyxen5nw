import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const messages = await prisma.message.findMany({
      select: {
        id: true,
        recipient: true,
        content: true,
        status: true,
        userId: true,
        createdAt: true,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Messages retrieved successfully',
        data: messages,
      },
      { status: 200 }
    );
  } catch (error: any) {
    console.error('Error retrieving messages:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 }
    );
  }
}