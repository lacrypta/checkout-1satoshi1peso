/** @type {import('next').NextConfig} */
const nextConfig = {
  env: {
    NEXT_SIGNER_PRIVATE_KEY: process.env.SIGNER_PRIVATE_KEY,
    NEXT_ADMIN_PUBLIC_KEY: process.env.ADMIN_PUBLIC_KEY,
    NEXT_TICKET_PRICE_ARS: process.env.TICKET_PRICE_ARS,
    NEXT_SENDY_API_URL: process.env.SENDY_API_URL,
    NEXT_SENDY_API_KEY: process.env.SENDY_API_KEY,
    NEXT_SENDY_LIST_ID: process.env.SENDY_LIST_ID,
    NEXT_AWS_ACCESS_KEY_ID: process.env.AWS_ACCESS_KEY_ID,
    NEXT_AWS_SECRET_ACCESS_KEY: process.env.AWS_SECRET_ACCESS_KEY,
    NEXT_DISCOUNT_CODES: process.env.DISCOUNT_CODES,
    NEXT_MAX_TICKETS: process.env.MAX_TICKETS,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
};

export default nextConfig;
