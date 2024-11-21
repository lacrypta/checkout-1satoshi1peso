import { getCodeDiscountFront } from '@/lib/utils/codes';
import { useEffect, useState } from 'react';

interface UseCodeReturn {
  discountMultiple: number;
  code: string;
  isLoading: boolean;
  setCode: (code: string) => void;
}

const useCode = (): UseCodeReturn => {
  const [code, setCode] = useState<string>('');
  const [discountMultiple, setDiscountMultiple] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);

  useEffect(() => {
    const codeFix = code.trim().toLowerCase();

    console.log('[HOOK] code', codeFix);

    if (codeFix === '') {
      setDiscountMultiple(1);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);

    const timeoutId = setTimeout(() => {
      const discount = getCodeDiscountFront(codeFix);

      setDiscountMultiple(discount);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timeoutId);
  }, [code]);

  return {
    discountMultiple,
    code,
    isLoading,
    setCode,
  };
};

export default useCode;
