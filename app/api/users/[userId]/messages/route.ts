import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { TwilioSMS } from '@/lib/twilio-sms';
import { getAuthSession } from "@/lib/authOptions";

type MessageRequestBody = {
  recipient: string;
  content: string;
};

export async function POST(
  request: Request,
  { params }: { params: { userId: string } },
) {
  try {
    const userId = params.userId;
    const body: MessageRequestBody = await request.json();
    const { recipient, content } = body;

    if (!recipient || !content) {
      return NextResponse.json(
        { success: false, message: 'Missing required fields' },
        { status: 400 },
      );
    }

    const session = await getAuthSession();
    if (!session || session.user.id !== userId) {
      return NextResponse.json(
        { success: false, message: 'Unauthorized' },
        { status: 403 },
      );
    }

    const user = await prisma.user.findFirst({
      where: { id: userId },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: 'User not found' },
        { status: 404 },
      );
    }

    const twilioClient = new TwilioSMS({
      accountSid: process.env.TWILIO_ACCOUNT_SID!,
      authToken: process.env.TWILIO_AUTH_TOKEN!,
      from: process.env.TWILIO_FROM_NUMBER!,
    });

    try {
      await twilioClient.sendSMS(recipient, content);
    } catch (error: any) {
      return NextResponse.json(
        { success: false, message: 'Failed to send SMS', data: error },
        { status: 500 },
      );
    }

    const message = await prisma.message.create({
      data: {
        recipient: String(recipient),
        content: String(content),
        status: 'sent',
        userId: userId,
      },
    });

    return NextResponse.json(
      {
        success: true,
        message: 'Message sent successfully',
        data: {
          id: message.id,
          recipient: message.recipient,
          content: message.content,
          status: message.status,
          userId: message.userId,
          createdAt: message.createdAt,
        },
      },
      { status: 201 },
    );
  } catch (error: any) {
    console.error('Error sending message:', error);
    return NextResponse.json(
      { success: false, message: 'Internal server error', data: error },
      { status: 500 },
    );
  }
}