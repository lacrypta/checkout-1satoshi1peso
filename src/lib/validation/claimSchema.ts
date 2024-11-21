import { Event, validateEvent, verifyEvent } from 'nostr-tools';
import { z } from 'zod';
// import { claimEventSchema } from './nostrEventSchema';

const tagSchema = z.tuple([z.string(), z.string()]);

const orderDescriptionSchema = z.string().refine(
  (value) => {
    try {
      JSON.parse(value);
      return true;
    } catch {
      return false;
    }
  },
  { message: 'Invalid JSON in description tag' }
);

export const orderClaimSchema = z.object({
  fullname: z.string().min(3, { message: 'Fullname is required' }),
  email: z.string().email({ message: 'Invalid email address' }),
  zapReceipt: z.object({
    kind: z.literal(9735),
    tags: z
      .array(tagSchema)
      .refine(
        (tags) => {
          const tagNames = tags.map((tag) => tag[0]);
          return (
            tagNames.includes('e') &&
            tagNames.includes('bolt11') &&
            tagNames.includes('description') &&
            tagNames.includes('p')
          );
        },
        { message: 'Must include tags e, bolt11, description and p' }
      )
      .refine(
        (tags) => {
          const descriptionTag = tags.find((tag) => tag[0] === 'description');
          return descriptionTag
            ? orderDescriptionSchema.safeParse(descriptionTag[1]).success
            : false;
        },
        { message: 'Description tag must contain valid JSON' }
      ),
    content: z.string(),
    created_at: z.number().int().positive({ message: 'Invalid timestamp' }),
    pubkey: z.string().length(64, { message: 'Invalid public key' }),
    id: z.string().length(64, { message: 'Invalid ID' }),
    sig: z.string().length(128, { message: 'Invalid signature' }),
  }),
  code: z.string().optional(),
  // claimEvent: claimEventSchema,
});

export function validateZapReceiptEmitter(zapEvent: Event): boolean {
  if (zapEvent.tags.find((tag) => tag[0] === 'p')![1] !== zapEvent.pubkey) {
    return false;
  }

  return true;
}

export function validateZapRequest(
  zapEvent: Event,
  signerPublicKey: string
): boolean {
  const zapRequest: Event = JSON.parse(
    zapEvent.tags.find((tag) => tag[0] === 'description')![1]
  );

  const isValidEvent = validateEvent(zapRequest);

  if (!isValidEvent) {
    return false;
  }

  const isVerifyEvent = verifyEvent(zapEvent);

  if (!isVerifyEvent) {
    return false;
  }

  if (zapRequest.pubkey !== signerPublicKey) {
    return false;
  }

  return true;
}

// export function validateClaimEvent(
//   claimEvent: Event,
//   adminPublicKey: string
// ): boolean {
//   const isValidEvent = validateEvent(claimEvent);

//   if (!isValidEvent) {
//     return false;
//   }

//   const isVerifyEvent = verifyEvent(claimEvent);

//   if (!isVerifyEvent) {
//     return false;
//   }

//   if (claimEvent.pubkey !== adminPublicKey) {
//     return false;
//   }

//   return true;
// }
