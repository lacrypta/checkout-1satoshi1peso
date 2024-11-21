import { Event, EventTemplate, finalizeEvent } from 'nostr-tools';

function generateZapRequest(
  orderId: string,
  amountSats: number,
  nostrPubkey: string
): Event {
  const unsignedZapRequest: EventTemplate = {
    kind: 9734,
    tags: [
      ['p', nostrPubkey],
      ['amount', amountSats.toString()],
      ['relays', 'wss://relay.lawallet.ar', 'wss://nostr-pub.wellorder.net'],
      ['e', orderId],
    ] as string[][],
    content: '',
    created_at: Math.round(Date.now() / 1000),
  };

  const privateKey = Uint8Array.from(
    Buffer.from(process.env.SIGNER_PRIVATE_KEY!, 'hex')
  );

  const zapRequest: Event = finalizeEvent(unsignedZapRequest, privateKey);

  return zapRequest;
}

function convertEvent(event: any): Event {
  return {
    tags: event.tags as string[][],
    content: event.content as string,
    created_at: event.created_at as number,
    pubkey: event.pubkey as string,
    id: event.id as string,
    kind: event.kind as number,
    sig: event.sig as string,
  };
}

export { convertEvent, generateZapRequest };
