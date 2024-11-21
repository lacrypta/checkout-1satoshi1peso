import { AppError } from '@/lib/errors/appError';
import { getCodeDiscountBack } from '@/lib/utils/codes';
import { generateZapRequest } from '@/lib/utils/nostr';
import { calculateTicketPrice } from '@/lib/utils/price';
import { createOrder, CreateOrderResponse } from '@/lib/utils/prisma';
import { requestOrderSchema } from '@/lib/validation/requestOrderSchema';
import { generateInvoice, getLnurlpFromWalias } from '@/services/ln';
import { sendy } from '@/services/sendy';
import { ses } from '@/services/ses';
import { NextRequest, NextResponse } from 'next/server';
import { Event } from 'nostr-tools';

interface RequestTicketResponse {
  pr: string;
  verify: string;
  eventReferenceId: string;
  code: string | null;
}

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    const body = await req.json();

    // Zod
    const result = requestOrderSchema.safeParse(body);

    if (!result.success) {
      throw new AppError(result.error.errors[0].message, 400);
    }

    const { fullname, email, ticketQuantity, newsletter, code } = result.data;

    // Prisma Create order and user (if not created before) in prisma
    let orderResponse: CreateOrderResponse;
    // Calculate ticket price
    const discountMultiple = code
      ? await getCodeDiscountBack(code.toLowerCase())
      : 1;
    const ticketPriceArs = parseInt(
      (parseInt(process.env.NEXT_TICKET_PRICE_ARS!) * discountMultiple).toFixed(
        0
      )
    );
    const totalMiliSats =
      (await calculateTicketPrice(ticketQuantity, ticketPriceArs)) * 1000;

    try {
      orderResponse = await createOrder(
        fullname,
        email,
        ticketQuantity,
        totalMiliSats
      );
    } catch (error: any) {
      throw new AppError(`Failed to create order.`, 500);
    }

    // Sendy
    // Subscribe to newsletter
    if (newsletter) {
      const sendyResponse = await sendy.subscribe({
        name: fullname,
        email,
        listId: process.env.NEXT_SENDY_LIST_ID!,
      });

      if (sendyResponse.message !== 'Already subscribed') {
        if (!sendyResponse.success) {
          throw new AppError(
            `Subscribe to newsletter failed. ${sendyResponse.message}`,
            404
          );
        }

        // AWS SES
        try {
          await ses.sendEmailNewsletter(email);
        } catch (error: any) {
          throw new AppError(
            error.message || 'Failed to send email via SES',
            500
          );
        }
      }
    }

    // Lnurlp
    let lnurlp;
    try {
      const posWalias = process.env.POS_WALIAS!;
      lnurlp = await getLnurlpFromWalias(posWalias);
    } catch (error) {
      throw new AppError('Failed to retrieve LNURLP data', 500);
    }

    // Zap Request
    let zapRequest: Event;
    try {
      zapRequest = generateZapRequest(
        orderResponse.eventReferenceId,
        totalMiliSats,
        lnurlp.nostrPubkey
      );
    } catch (error: any) {
      throw new AppError('Failed to generate Zap Request', 500);
    }

    // Invoice
    let pr: string;
    let verify: string;
    try {
      ({ pr, verify } = await generateInvoice(
        lnurlp.callback,
        totalMiliSats,
        zapRequest
      ));
    } catch (error: any) {
      throw new AppError('Failed to generate Invoice', 500);
    }

    // Response
    const response: RequestTicketResponse = {
      pr: pr,
      verify,
      eventReferenceId: orderResponse.eventReferenceId,
      code: code || null,
    };

    // // New logic to connect to relay and listen for payment events
    // const relay = await generateRelay({
    //   relayUrl: 'wss://relay.lawallet.ar',
    //   filters: [{ kinds: [9735], '#e': [orderResponse.eventReferenceId] }],
    //   onEventCallback: async (event) => {
    //     console.log('Payment confirmed and processed in backend.');

    //     // Call the claim API to claim the payment
    //     try {
    //       const claimResponse = await fetch(
    //         `${process.env.NEXT_PUBLIC_API_URL}/api/ticket/claim`,
    //         {
    //           method: 'POST',
    //           headers: {
    //             'Content-Type': 'application/json',
    //           },
    //           body: JSON.stringify({
    //             fullname,
    //             email,
    //             zapReceipt: event, // Assuming the event contains the zap receipt
    //           }),
    //         }
    //       );

    //       const claimData = await claimResponse.json();
    //       if (!claimData.status) {
    //         console.error('Failed to claim payment:', claimData.errors);
    //       }
    //     } catch (error) {
    //       console.error('Error calling claim API:', error);
    //     }
    //   },
    // });

    return NextResponse.json({
      status: true,
      data: response,
    });
  } catch (error: any) {
    const statusCode = error.statusCode || 500;
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: statusCode }
    );
  }
}
