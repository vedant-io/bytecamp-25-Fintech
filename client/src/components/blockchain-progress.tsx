import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Loader2, CheckCircle2, XCircle } from "lucide-react";

interface BlockchainProgressProps {
  status: 'pending' | 'completed' | 'failed';
  hash?: string;
}

export default function BlockchainProgress({ status, hash }: BlockchainProgressProps) {
  const [progress, setProgress] = useState(0);

  // Simulate blockchain confirmation progress
  useEffect(() => {
    if (status === 'pending') {
      const interval = setInterval(() => {
        setProgress(prev => {
          const next = prev + 10;
          return next > 90 ? 90 : next; // Max at 90% until completed
        });
      }, 1000);
      return () => clearInterval(interval);
    } else if (status === 'completed') {
      setProgress(100);
    }
  }, [status]);

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="pt-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {status === 'pending' && (
                <Loader2 className="h-5 w-5 animate-spin text-primary" />
              )}
              {status === 'completed' && (
                <CheckCircle2 className="h-5 w-5 text-green-500" />
              )}
              {status === 'failed' && (
                <XCircle className="h-5 w-5 text-red-500" />
              )}
              <span className="font-medium capitalize">{status}</span>
            </div>
            {hash && (
              <span className="text-sm text-muted-foreground">
                {hash.slice(0, 6)}...{hash.slice(-4)}
              </span>
            )}
          </div>

          <Progress value={progress} className="h-2" />

          {/* Blockchain animation */}
          <div className="relative h-20 mt-4">
            <div className="absolute inset-0 flex items-center justify-between">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className={`h-4 w-4 rounded-full transition-colors duration-500 ${
                    progress > i * 25 ? 'bg-primary' : 'bg-muted'
                  }`}
                >
                  <div
                    className={`absolute h-0.5 w-full right-0 top-1/2 -translate-y-1/2 transition-colors duration-500 ${
                      progress > i * 25 ? 'bg-primary' : 'bg-muted'
                    }`}
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Status message */}
          <p className="text-sm text-center text-muted-foreground">
            {status === 'pending' && 'Confirming transaction on the blockchain...'}
            {status === 'completed' && 'Transaction confirmed!'}
            {status === 'failed' && 'Transaction failed. Please try again.'}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
