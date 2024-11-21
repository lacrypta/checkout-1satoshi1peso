import { Event, validateEvent, verifyEvent } from 'nostr-tools';
import { z } from 'zod';

const tagSchema = z.tuple([z.string(), z.string()]);

export const ticketsEventContentSchema = z.object({
  limit: z.number().int(),
  checked_in: z.boolean().optional(),
  ticket_id: z.string().length(32).optional(),
  email: z.string().optional(),
});

export const ticketsEventSchema = z.object({
  kind: z.literal(27242),
  tags: z.array(z.never()),
  content: z.string().refine(
    (data) => {
      try {
        const parsed = JSON.parse(data);
        ticketsEventContentSchema.parse(parsed);
        return true;
      } catch (error: any) {
        return false;
      }
    },
    {
      message: 'Invalid content format',
    }
  ),
  created_at: z.number().int().positive({ message: 'Invalid timestamp' }),
  pubkey: z.string().length(64, { message: 'Invalid public key' }),
  id: z.string().length(64, { message: 'Invalid ID' }),
  sig: z.string().length(128, { message: 'Invalid signature' }),
});

export const checkInEventSchema = z.object({
  kind: z.literal(27241),
  tags: z.array(z.never()),
  content: z.string().refine(
    (data) => {
      try {
        const { ticket_id } = JSON.parse(data);
        z.string().length(32).parse(ticket_id);
        return true;
      } catch (error: any) {
        return false;
      }
    },
    {
      message: 'Invalid content format',
    }
  ),
  created_at: z.number().int().positive({ message: 'Invalid timestamp' }),
  pubkey: z.string().length(64, { message: 'Invalid public key' }),
  id: z.string().length(64, { message: 'Invalid ID' }),
  sig: z.string().length(128, { message: 'Invalid signature' }),
});

export const inviteEventContentSchema = z.object({
  action: z.literal('add' || 'remove'),
  list: z.array(z.array(z.string(), z.string())),
});

export const inviteEventSchema = z.object({
  kind: z.literal(27243),
  tags: z.array(z.never()),
  content: z.string().refine(
    (data) => {
      try {
        const parsed = JSON.parse(data);
        inviteEventContentSchema.parse(parsed);
        return true;
      } catch (error: any) {
        return false;
      }
    },
    {
      message: 'Invalid content format',
    }
  ),
  created_at: z.number().int().positive({ message: 'Invalid timestamp' }),
  pubkey: z.string().length(64, { message: 'Invalid public key' }),
  id: z.string().length(64, { message: 'Invalid ID' }),
  sig: z.string().length(128, { message: 'Invalid signature' }),
});

export function validateTicketEvent(
  orderEvent: Event,
  adminPublicKey: string
): boolean {
  const isValidEvent = validateEvent(orderEvent);

  if (!isValidEvent) {
    return false;
  }

  const isVerifyEvent = verifyEvent(orderEvent);

  if (!isVerifyEvent) {
    return false;
  }

  if (orderEvent.pubkey !== adminPublicKey) {
    return false;
  }

  return true;
}
