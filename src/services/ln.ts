import { Event } from 'nostr-tools';

interface GenerateInvoiceResponse {
  pr: string;
  verify: string;
}

async function generateInvoice(
  callbackUrl: string,
  amount: number,
  zapEvent?: Event
): Promise<GenerateInvoiceResponse> {
  let url = `${callbackUrl}?amount=${amount}`;

  if (zapEvent) {
    const encodedZapEvent = encodeURI(JSON.stringify(zapEvent));

    url += `&nostr=${encodedZapEvent}&lnurl=lnurl`;
  }

  const response = (await (await fetch(url)).json()) as any;
  const pr = response.pr as string;
  const verify = response.verify as string;

  return {
    pr,
    verify,
  };
}

async function getLnurlpFromWalias(walias: string): Promise<any> {
  const name = walias.split('@')[0];
  const domain = walias.split('@')[1];

  const url = `https://${domain}/.well-known/lnurlp/${name}`;

  return await (await fetch(url)).json();
}

export { generateInvoice, getLnurlpFromWalias };
