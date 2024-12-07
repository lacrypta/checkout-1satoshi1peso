import { prisma } from '@/services/prismaClient';
import { Order, Ticket, User } from '@prisma/client';
import { randomBytes } from 'crypto';
import { Event } from 'nostr-tools';

export interface CreateOrderResponse {
  eventReferenceId: string;
}

export interface UpdatePaidOrderResponse {
  tickets: Ticket[];
  alreadyPaid: boolean;
}

export interface CheckInTicketResponse {
  alreadyCheckedIn: boolean;
  checkIn: boolean;
}

export interface CreateInviteResponse {
  ticketList: [string, string][];
}

// Create order and user (or update), not yet create ticket
async function createOrder(
  fullname: string,
  email: string,
  ticketQuantity: number,
  totalMiliSats: number
): Promise<CreateOrderResponse> {
  const eventReferenceId: string = randomBytes(32).toString('hex');

  const { order, user } = await prisma.$transaction(async () => {
    // Create or update user
    const user: User | null = await prisma.user.upsert({
      where: {
        email,
      },
      update: {},
      create: { fullname, email },
    });

    // Create order
    const order: Order | null = await prisma.order.create({
      data: {
        eventReferenceId,
        ticketQuantity,
        totalMiliSats,
        userId: user.id,
      },
    });

    return { order, user };
  });

  if (!order || !user) {
    throw new Error('Order or user not created');
  }

  const response: CreateOrderResponse = {
    eventReferenceId,
  };

  return response;
}

async function updatePaidOrder(
  fullname: string,
  email: string,
  zapReceipt: Event,
  code: string | null
): Promise<UpdatePaidOrderResponse> {
  const eventReferenceId = zapReceipt.tags.find((tag) => tag[0] === 'e')![1];

  const { order, user, tickets, alreadyPaid } = await prisma.$transaction(
    async () => {
      // Check if order is already paid
      const existingOrder = await prisma.order.findUnique({
        where: { eventReferenceId },
        select: { paid: true },
      });

      if (existingOrder?.paid) {
        return { order: null, user: null, tickets: [], alreadyPaid: true };
      }

      // Update order to paid
      const order: Order | null = await prisma.order.update({
        where: { eventReferenceId },
        data: {
          paid: true,
          zapReceiptId: zapReceipt.id,
        },
      });

      // Update the user in case their name changes
      const user: User | null = await prisma.user.update({
        where: { email },
        data: { fullname },
      });

      if (code) {
        await prisma.code.update({
          where: { code },
          data: {
            used: {
              increment: 1,
            },
          },
        });
      }

      if (!order || !order.userId) {
        throw new Error('Order or user not found, cannot create ticket');
      }

      // Create tickets
      let tickets: Ticket[] = [];

      for (let i = 0; i < order.ticketQuantity; i++) {
        const ticketId: string = randomBytes(16).toString('hex');

        const ticket: Ticket | null = await prisma.ticket.create({
          data: {
            ticketId,
            userId: order.userId,
            orderId: order.id,
          },
        });

        tickets.push(ticket);
      }

      return { order, user, tickets, alreadyPaid: false };
    }
  );

  if (alreadyPaid) {
    return { tickets: [], alreadyPaid };
  }

  if (!order || tickets.length === 0) {
    throw new Error('Order or user not found or ticket not created');
  }

  return { tickets, alreadyPaid };
}

async function checkInTicket(ticketId: string): Promise<CheckInTicketResponse> {
  const { alreadyCheckedIn, checkIn } = await prisma.$transaction(
    // To Do: optimize this query with conditional update
    async () => {
      // Find ticket
      const ticket: Ticket | null = await prisma.ticket.findUnique({
        where: {
          ticketId,
        },
      });

      if (!ticket) {
        throw new Error('Ticket not found');
      }

      // Check if ticket is already checked in
      let alreadyCheckedIn = false;

      if (ticket.checkIn) {
        alreadyCheckedIn = true;

        return { alreadyCheckedIn, checkIn: true };
      }

      // Update ticket to checked in
      const ticketChecked: Ticket = await prisma.ticket.update({
        where: {
          ticketId,
        },
        data: {
          checkIn: true,
        },
      });

      if (!ticketChecked) {
        throw new Error('Error checking in ticket');
      }

      return { alreadyCheckedIn: false, checkIn: true };
    }
  );

  const response: CheckInTicketResponse = {
    alreadyCheckedIn,
    checkIn,
  };

  return response;
}

// Add user to database
async function createInvite(
  action: string,
  list: [string, string][]
): Promise<CreateInviteResponse> {
  const { ticketList } = await prisma.$transaction(async (prisma) => {
    let ticketList: [string, string][] = [];

    if (action === 'add') {
      for (const [fullname, email] of list) {
        console.log(fullname, email);
        // Create user
        const user = await prisma.user.upsert({
          where: {
            email,
          },
          update: {
            fullname,
          },
          create: {
            fullname,
            email,
          },
        });

        console.log(user);

        // Create ticket for the user
        const ticketId: string = randomBytes(16).toString('hex');

        const ticket: Ticket = await prisma.ticket.create({
          data: {
            ticketId,
            userId: user.id,
            orderId: null,
          },
        });

        ticketList.push([user.email, ticket.ticketId!]);
      }
    } else if (action === 'remove') {
      // TODO: Implement this
      // const emails = list.map(([_, email]) => email); // Extract emails from the array
      // // Remove users and their related tickets
      // const ticket = await prisma.ticket.deleteMany({
      //   where: {
      //     User: {
      //       email: {
      //         in: emails,
      //       },
      //     },
      //   },
      // });
      // tickets.push(ticket.ticketId!);
      // await prisma.user.deleteMany({
      //   where: {
      //     email: {
      //       in: emails,
      //     },
      //   },
      // });
    }

    return { ticketList };
  });

  if (ticketList.length === 0) {
    throw new Error('Failed to create invite');
  }

  const response: CreateInviteResponse = {
    ticketList,
  };

  return response;
}

// Function to count total tickets in the database
async function countTotalTickets(): Promise<number> {
  const count = await prisma.ticket.count();
  return count;
}

export {
  checkInTicket,
  countTotalTickets,
  createInvite,
  createOrder,
  updatePaidOrder,
};
