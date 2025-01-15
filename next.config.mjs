/** @type {import('next').NextConfig} */
import { withSentryConfig } from '@sentry/nextjs';

const nextConfig = {
  env: {
    NEXT_SIGNER_PRIVATE_KEY: process.env.SIGNER_PRIVATE_KEY,
    NEXT_ADMIN_PUBLIC_KEY: process.env.ADMIN_PUBLIC_KEY,
    NEXT_TICKET_PRICE_SATS: process.env.TICKET_PRICE_SATS,
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

const configWithSentry = withSentryConfig(nextConfig, {
  org: process.env.SENTRY_ORG,
  project: process.env.SENTRY_PROJECT,
  authToken: process.env.SENTRY_AUTH_TOKEN,
  silent: false,
  telemetry: false,
});

export default configWithSentry;
