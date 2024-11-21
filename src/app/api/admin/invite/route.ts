import { AppError } from '@/lib/errors/appError';
import { createInvite } from '@/lib/utils/prisma';
import {
  inviteEventSchema,
  validateTicketEvent,
} from '@/lib/validation/nostrEventSchema';
import { ses } from '@/services/ses';
import { NextRequest, NextResponse } from 'next/server';
import { getPublicKey } from 'nostr-tools';

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    // Auth event
    const { authEvent } = await req.json();

    if (!authEvent) {
      throw new AppError('Missing auth event', 400);
    }

    // Zod
    const result = inviteEventSchema.safeParse(authEvent);

    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }

    // Event validation
    const privateKey = Uint8Array.from(
      Buffer.from(process.env.SIGNER_PRIVATE_KEY!, 'hex')
    );
    const adminPublicKey = getPublicKey(privateKey);

    const isValidOrderEvent = validateTicketEvent(result.data, adminPublicKey);

    if (!isValidOrderEvent) {
      throw new AppError('Invalid auth event', 403);
    }

    // Add email to db
    const { action, list } = JSON.parse(result.data.content);

    const { ticketList } = await createInvite(action, list);

    if (ticketList.length === 0) {
      throw new AppError('Failed to create invite', 500);
    }

    // Send ticket email
    // AWS SES
    try {
      for (const [email, ticketId] of ticketList) {
        await ses.sendEmailOrder(email, ticketId);
      }
    } catch (error: any) {
      throw new AppError('Failed to send order email', 500);
    }

    return NextResponse.json({
      status: true,
      data: {
        message: `Invite list ${action}ed successfully`,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
