import { prisma } from '@/services/prismaClient';

export async function getCodeDiscountBack(_code: string): Promise<number> {
  if (!_code) {
    return 1;
  }

  const code = await prisma.code.findUnique({
    where: { code: _code },
  });

  if (code) {
    return (100 - code.discount) / 100;
  }

  return 1;
}

const codes: { [key: string]: number } = JSON.parse(
  process.env.NEXT_DISCOUNT_CODES || '{}'
);

export function getCodeDiscountFront(code: string) {
  if (codes[code]) {
    return (100 - codes[code]) / 100;
  }
  return 1;
}
