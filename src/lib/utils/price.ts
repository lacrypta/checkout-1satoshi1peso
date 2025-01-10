// import axios from 'axios';

// const urlYadio = 'https://api.yadio.io/exrates/ARS';
// let lastFetchTime: number | null = null;
// let cachedBtcPrice: number | null = null;
// const FETCH_INTERVAL = 60 * 1000;

// async function getBtcPrice(): Promise<number> {
//   const currentTime = Date.now();

//   if (
//     lastFetchTime &&
//     currentTime - lastFetchTime < FETCH_INTERVAL &&
//     cachedBtcPrice !== null
//   ) {
//     console.log('Using cached BTC price...');
//     return cachedBtcPrice;
//   }

//   try {
//     const res = await axios.get(urlYadio);
//     const btcPrice = res.data.BTC;

//     lastFetchTime = currentTime;
//     cachedBtcPrice = btcPrice;

//     console.log('Fetching BTC price...');
//     return btcPrice;
//   } catch (error) {
//     throw new Error('Could not fetch BTC price');
//   }
// }

// async function convertMiliSatsToArs(priceMiliSats: number): Promise<number> {
//   return Math.round(((await getBtcPrice()) / priceMiliSats) * 100000000000);
// }

// async function calculateTicketPrice(
//   qty: number,
//   ticketPriceMiliSats: number
// ): Promise<number> {
//   const ticketPriceSats: number =
//     (await convertMiliSatsToArs(ticketPriceMiliSats)) / 1000;

//   const totalTicketPrice: number = qty * ticketPriceSats;

//   return totalTicketPrice;
// }

// export { calculateTicketPrice };

import axios from 'axios';

const urlYadio = 'https://api.yadio.io/exrates/ARS';
let lastFetchTime: number | null = null;
let cachedBtcPrice: number | null = null;
const FETCH_INTERVAL = 60 * 1000;

async function getBtcPrice(): Promise<number> {
  const currentTime = Date.now();

  if (
    lastFetchTime &&
    currentTime - lastFetchTime < FETCH_INTERVAL &&
    cachedBtcPrice !== null
  ) {
    return cachedBtcPrice;
  }

  try {
    const res = await axios.get(urlYadio);
    const btcPrice = res.data.BTC;

    lastFetchTime = currentTime;
    cachedBtcPrice = btcPrice;

    return btcPrice;
  } catch (error) {
    throw new Error('Could not fetch BTC price');
  }
}

async function convertSatsToArs(priceSats: number): Promise<number> {
  const btcPrice = await getBtcPrice();
  return Math.round((btcPrice * priceSats) / 100000000);
}

async function calculateTicketPrice(
  qty: number,
  ticketPriceSats: number
): Promise<number> {
  const ticketPriceArs = await convertSatsToArs(ticketPriceSats);
  return qty * ticketPriceArs;
}

export { calculateTicketPrice, convertSatsToArs };
