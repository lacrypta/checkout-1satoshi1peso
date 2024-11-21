import { AppError } from '@/lib/errors/appError';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    if (req.method !== 'POST') {
      throw new AppError('Method not allowed', 405);
    }

    const { publicKey } = await req.json();

    // Authentication
    if (publicKey !== process.env.NEXT_ADMIN_PUBLIC_KEY) {
      throw new AppError('Unauthorized', 401);
    }

    return NextResponse.json({ status: true, data: { message: 'Authorized' } });
  } catch (error: any) {
    return NextResponse.json(
      { status: false, errors: error.message || 'Internal Server Error' },
      { status: error.statusCode || 500 }
    );
  }
}
