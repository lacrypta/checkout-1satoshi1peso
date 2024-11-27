import { AppError } from '@/lib/errors/appError';
import { updatePaidOrder, UpdatePaidOrderResponse } from '@/lib/utils/prisma';
import {
  orderClaimSchema,
  validateZapReceiptEmitter,
  validateZapRequest,
} from '@/lib/validation/claimSchema';
import { ses } from '@/services/ses';
import { NextRequest, NextResponse } from 'next/server';
import { getPublicKey, validateEvent } from 'nostr-tools';
import * as Sentry from '@sentry/nextjs';

interface OrderClaimResponse {
  claim: boolean;
}

export async function POST(req: NextRequest) {
  let body;

  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    body = await req.json();

    // Zod
    const result = orderClaimSchema.safeParse(body);

    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }

    const { fullname, email, zapReceipt, code } = result.data;

    // Validate zapReceipt
    const isValidEvent = validateEvent(zapReceipt);
    if (!isValidEvent) {
      throw new AppError('Invalid zap receipt', 403);
    }

    const isValidEmitter = validateZapReceiptEmitter(zapReceipt);
    if (!isValidEmitter) {
      throw new AppError('Invalid zap receipt emitter', 403);
    }

    // Validate zapRequest
    const publicKey = getPublicKey(
      Uint8Array.from(Buffer.from(process.env.NEXT_SIGNER_PRIVATE_KEY!, 'hex'))
    );
    const isValidZapRequest = validateZapRequest(zapReceipt, publicKey);
    if (!isValidZapRequest) {
      throw new AppError('Invalid zapRequest', 403);
    }

    // Prisma
    let updateOrderResponse: UpdatePaidOrderResponse;
    try {
      updateOrderResponse = await updatePaidOrder(
        fullname,
        email,
        zapReceipt,
        code || null
      );
    } catch (error: any) {
      throw new AppError('Failed to update order', 500);
    }

    // AWS SES
    if (!updateOrderResponse.alreadyPaid) {
      try {
        for (const ticket of updateOrderResponse.tickets) {
          await ses.sendEmailOrder(email, ticket.ticketId!); // TODO: send one email with all tickets
        }
      } catch (error: any) {
        throw new AppError('Failed to send order email', 500);
      }
    }

    // Response
    const response: OrderClaimResponse = {
      claim: true,
    };

    return NextResponse.json({
      status: true,
      data: response,
    });
  } catch (error: any) {
    Sentry.captureException(error, { extra: body });

    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
