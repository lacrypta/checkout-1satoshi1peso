import { AppError } from '@/lib/errors/appError';
import { checkInTicket } from '@/lib/utils/prisma';
import {
  checkInEventSchema,
  validateTicketEvent,
} from '@/lib/validation/nostrEventSchema';
import { NextRequest, NextResponse } from 'next/server';
import * as Sentry from '@sentry/nextjs';

interface CheckInResponse {
  checkIn: boolean;
  alreadyCheckedIn: boolean;
}

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
    const result = checkInEventSchema.safeParse(authEvent);

    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }

    // Event validation
    const adminPublicKey = process.env.NEXT_ADMIN_PUBLIC_KEY!;

    const isValidOrderEvent = validateTicketEvent(result.data, adminPublicKey);

    if (!isValidOrderEvent) {
      throw new AppError('Invalid ticket event', 403);
    }

    // Check ticket
    const { ticket_id: ticketId } = JSON.parse(result.data.content);

    const { alreadyCheckedIn, checkIn } = await checkInTicket(ticketId);

    const data: CheckInResponse = {
      alreadyCheckedIn,
      checkIn,
    };

    return NextResponse.json({
      status: true,
      data,
    });
  } catch (error: any) {
    Sentry.captureException(error);

    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
