import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Loader2 } from "lucide-react";
import { useAuth } from "@/hooks/use-auth";
import BlockchainProgress from "./blockchain-progress";

interface DonationFormProps {
  ngoId: number;
}

export default function DonationForm({ ngoId }: DonationFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [amount, setAmount] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<
    "pending" | "completed" | "failed" | null
  >(null);
  const [transactionHash, setTransactionHash] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Ensure that only donors can make a donation
    if (!user || user.role !== "donor") {
      toast({
        title: "Access Denied",
        description: "Only donors can make donations.",
        variant: "destructive",
      });
      return;
    }

    // Validate the donation amount
    const donationAmount = parseFloat(amount);
    if (!amount || donationAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid donation amount.",
        variant: "destructive",
      });
      return;
    }

    // Start the submission process: update state to show progress
    setIsSubmitting(true);
    setTransactionStatus("pending");
    // Generate a temporary transaction hash for display purposes
    setTransactionHash("0x" + Math.random().toString(16).slice(2));

    try {
      console.log("Initiating Coinbase checkout for amount:", donationAmount);

      // Send API request to your backend endpoint that handles Coinbase checkout
      const response = await apiRequest("POST", "/api/donations/checkout", {
        amount: donationAmount,
        currency: "USD",
        ngoId,
      });

      const { charge } = await response.json();
      console.log("Coinbase charge created:", charge);

      if (charge && charge.hosted_url) {
        // Optionally, you can display a progress animation here before redirecting
        setTimeout(() => {
          // Redirect donor to the hosted checkout page provided by Coinbase
          window.location.href = charge.hosted_url;
        }, 2000);
      } else {
        throw new Error("No checkout URL received from Coinbase");
      }
    } catch (error) {
      console.error("Donation error:", error);
      setTransactionStatus("failed");
      toast({
        title: "Transaction Failed",
        description:
          error instanceof Error ? error.message : "Failed to process donation",
        variant: "destructive",
      });
      setIsSubmitting(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Make a Donation</CardTitle>
      </CardHeader>
      <CardContent>
        {transactionStatus ? (
          // Show a progress component that can display the current blockchain transaction status
          <BlockchainProgress
            status={transactionStatus}
            hash={transactionHash || undefined}
          />
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount ($)</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                disabled={isSubmitting}
                className="text-lg"
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isSubmitting || !amount}
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center justify-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Processing...</span>
                </div>
              ) : (
                "Donate Now"
              )}
            </Button>
            <p className="text-sm text-muted-foreground text-center">
              Secure payments powered by Coinbase Commerce
            </p>
          </form>
        )}
      </CardContent>
    </Card>
  );
}

