import { PrismaClient } from '@prisma/client';
import { AppError } from '@/lib/errors/appError';
import { NextRequest, NextResponse } from 'next/server';
import {
  ticketsEventContentSchema,
  ticketsEventSchema,
} from '@/lib/validation/nostrEventSchema';
import { validateTicketEvent } from '@/lib/validation/nostrEventSchema';

const prisma = new PrismaClient();

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    const { authEvent } = await req.json();

    if (!authEvent) {
      throw new AppError('Missing auth event', 400);
    }

    // Zod
    const result = ticketsEventSchema.safeParse(authEvent);

    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }

    // Event validation
    const adminPublicKey = process.env.NEXT_ADMIN_PUBLIC_KEY!;

    const isValidOrderEvent = validateTicketEvent(result.data, adminPublicKey);

    if (!isValidOrderEvent) {
      throw new AppError('Invalid order event', 403);
    }

    const contentResult = ticketsEventContentSchema.safeParse(
      JSON.parse(result.data.content)
    );

    if (!contentResult.success) {
      throw new AppError(contentResult.error.errors[0].message, 403);
    }

    const { limit, checked_in, ticket_id, email } = contentResult.data;

    // Prisma
    // Get tickets
    const whereClause: any = {
      ...(checked_in !== undefined && { checkIn: checked_in }),
      ...(ticket_id && { ticketId: ticket_id }),
      ...(email && {
        User: {
          email: email,
        },
      }),
    };

    const tickets = await prisma.ticket.findMany({
      take: limit || undefined,
      where: whereClause,
      include: {
        User: {
          select: {
            fullname: true,
            email: true,
          },
        },
      },
    });

    const formattedTickets = tickets.map((ticket) => ({
      user: {
        fullname: ticket.User?.fullname,
        email: ticket.User?.email,
      },
      ticketId: ticket.ticketId,
      checkIn: ticket.checkIn,
    }));

    return NextResponse.json({
      status: true,
      data: formattedTickets,
    });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
