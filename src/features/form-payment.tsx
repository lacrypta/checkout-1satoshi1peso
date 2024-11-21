'use client';

import { QRCodeSVG } from 'qrcode.react';

import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { decodeInvoice } from '@lawallet/react';
import { useEffect, useState } from 'react';
import Loading from '@/components/animations/loading';
import { toast } from '@/hooks/use-toast';

interface FormPaymentProps {
  invoice?: string;
}

export function FormPayment({ invoice }: FormPaymentProps) {
  const [timeRemaining, setTimeRemaining] = useState<number>(0);

  useEffect(() => {
    const decodedInvoice = decodeInvoice(invoice!);

    if (!decodedInvoice) {
      return;
    }

    const invoiceExpireDate =
      (decodedInvoice?.sections[4] as any).value + decodedInvoice?.expiry!;

    if (invoiceExpireDate) {
      const calculateTimeRemaining = () => {
        const now = new Date().getTime();
        const timeLeft = invoiceExpireDate - now / 1000;
        return Math.max(Math.floor(timeLeft), 0);
      };

      setTimeRemaining(calculateTimeRemaining());

      const timer = setInterval(() => {
        setTimeRemaining(calculateTimeRemaining());
      }, 1000);

      return () => clearInterval(timer);
    }
  }, [invoice]);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(
      2,
      '0'
    )}:${String(secs).padStart(2, '0')}`;
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(invoice!);
      return toast({
        title: 'Copied to clipboard',
      });
    } catch (error: any) {
      return toast({
        title: 'Failed to copy text',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  const payWithWebLN = async () => {
    try {
      if (!window.webln) {
        throw new Error('WebLN not detected');
      }
      await window.webln.enable();
      await window.webln.sendPayment(invoice!);
    } catch (error: any) {
      return toast({
        title: 'Error paying invoice',
        description: error.message,
        variant: 'destructive',
      });
    }
  };

  return (
    <>
      <div className="flex-1 flex flex-col gap-4">
        <div className="flex gap-4 items-center justify-end">
          <p className="text-sm text-text">Time:</p>
          <div className="flex gap-2 items-center justify-center">
            <TimeIcon className="w-4 h-4" />
            <span className="font-semibold text-sm">
              {formatTime(timeRemaining)}
            </span>
          </div>
        </div>

        <div className="flex-1 flex flex-col gap-4 justify-start">
          <Tabs defaultValue="lightning">
            <TabsList className="w-full bg-border">
              <TabsTrigger value="lightning" className="flex-1">
                Lightning
              </TabsTrigger>
              <TabsTrigger value="onchain" className="flex-1 gap-2" disabled>
                Onchain <Badge>Soon</Badge>
              </TabsTrigger>
            </TabsList>
            <TabsContent value="lightning">
              <Card className="py-8 md:py-12 bg-white">
                <div className="max-w-[300px] mx-auto">
                  {invoice ? (
                    <QRCodeSVG
                      value={invoice.toUpperCase()}
                      size={300}
                      imageSettings={{
                        // Iso 24x24, image 42x42
                        src: '/iso.png',
                        x: undefined,
                        y: undefined,
                        height: 42,
                        width: 42,
                        excavate: true,
                      }}
                    />
                  ) : (
                    // <Skeleton className="w-[300px] h-[300px]" />
                    <Loading />
                  )}
                </div>
              </Card>
              <div className="flex gap-2 w-full mt-2">
                {window.webln && (
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={payWithWebLN}
                    disabled={!Boolean(invoice)}
                  >
                    Pay with wallet
                  </Button>
                )}
                <Button
                  className="w-full"
                  onClick={handleCopy}
                  disabled={!Boolean(invoice)}
                >
                  Copy
                </Button>
              </div>
            </TabsContent>
            <TabsContent value="onchain">
              <Card>
                <CardHeader>
                  <CardTitle>Bitcoin Onchain</CardTitle>
                  <CardDescription>
                    Lorem ipsum dolor sit, amet consectetur
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="max-w-[300px] mx-auto">
                    <Skeleton className="w-[300px] h-[300px]" />
                  </div>
                </CardContent>
                <CardFooter>
                  <div className="flex gap-2 w-full justify-center">
                    <p className="text-text text-sm">Service not available.</p>
                  </div>
                </CardFooter>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </>
  );
}

function TimeIcon(props: any) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      width="20"
      height="20"
      color="currentColor"
      fill="none"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.5" />
      <path
        d="M12 8V12L14 14"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
