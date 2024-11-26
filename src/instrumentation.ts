import * as Sentry from '@sentry/nextjs';

export async function register() {
  if (!process.env.SENTRY_DSN || !process.env.SENTRY_AUTH_TOKEN) {
    console.warn(
      'SENTRY_DSN or SENTRY_AUTH_TOKEN is not defined. Error tracking will be disabled.'
    );
    return;
  }

  try {
    if (process.env.NEXT_RUNTIME === 'nodejs') {
      await import('../sentry.server.config');
    } else if (process.env.NEXT_RUNTIME === 'edge') {
      await import('../sentry.edge.config');
    } else {
      console.warn(`Unknown runtime: ${process.env.NEXT_RUNTIME}`);
    }
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

export const onRequestError = Sentry.captureRequestError;
