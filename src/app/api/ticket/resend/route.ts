import { prisma } from '@/services/prismaClient';
import { ses } from '@/services/ses';
import { Ticket } from '@prisma/client';
import { randomBytes } from 'crypto';
import { NextResponse } from 'next/server';

export async function GET() {
  const paidOrders = await prisma.order.findMany({
    where: {
      paid: true,
      tickets: {
        none: {},
      },
    },
    include: {
      User: {
        select: {
          email: true,
        },
      },
    },
  });

  //Create tickets
  let createdTickets: { [email: string]: Ticket[] } = {};
  try {
    await Promise.all(
      paidOrders.map(async (order) => {
        if (!order.User || !order.User.email) return;

        createdTickets[order.User.email] = [];

        for (let i = 0; i < order.ticketQuantity; i++) {
          const ticketId: string = randomBytes(16).toString('hex');

          const ticket: Ticket | null = await prisma.ticket.create({
            data: {
              ticketId,
              userId: order.userId!,
              orderId: order.id,
            },
          });

          if (!ticket) return;
          createdTickets[order.User.email].push(ticket);
        }
      })
    );

    for (const [email, userTickets] of Object.entries(createdTickets)) {
      for (const ticket of userTickets) {
        if (!ticket || !ticket.ticketId) return;

        await ses.sendEmailOrder(email, ticket.ticketId!);
      }
    }
  } catch (err) {
    return NextResponse.json({
      error: 'Failed to process tickets and send order emails',
    });
  }

  return NextResponse.json({ createdTickets });
}
