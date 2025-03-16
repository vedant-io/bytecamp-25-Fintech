import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/hooks/use-auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import DashboardStats from "@/components/dashboard-stats";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { useToast } from "@/hooks/use-toast";
import {
  insertWithdrawalSchema,
  type Withdrawal,
  type Ngo,
} from "@shared/schema";
import { Loader2 } from "lucide-react";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { z } from "zod";

// Define the withdrawal form data type using the schema
type WithdrawalFormData = z.infer<typeof insertWithdrawalSchema>;

export default function NgoDashboard() {
  const { user } = useAuth();
  const { toast } = useToast();

  // Query to fetch NGO data based on the logged-in user's ID
  const { data: ngo, isLoading: isLoadingNgo } = useQuery<Ngo>({
    queryKey: [`/api/ngos/user/${user?.id}`],
    queryFn: async () => {
      const res = await fetch(`/api/ngos/user/${user?.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch NGO data");
      }
      return res.json();
    },
    enabled: !!user?.id,
  });

  // Query to fetch withdrawals for the NGO
  const { data: withdrawals, isLoading: isLoadingWithdrawals } = useQuery<
    Withdrawal[]
  >({
    queryKey: [`/api/withdrawals/ngo/${ngo?.id}`],
    queryFn: async () => {
      const res = await fetch(`/api/withdrawals/ngo/${ngo?.id}`);
      if (!res.ok) {
        throw new Error("Failed to fetch withdrawals");
      }
      return res.json();
    },
    enabled: !!ngo?.id,
  });

  const form = useForm<WithdrawalFormData>({
    resolver: zodResolver(insertWithdrawalSchema),
    defaultValues: {
      amount: 0,
      purpose: "",
      status: "pending",
    },
  });

  const onSubmit = async (data: WithdrawalFormData) => {
    try {
      await apiRequest("POST", "/api/withdrawals", data);
      queryClient.invalidateQueries({
        queryKey: [`/api/withdrawals/ngo/${ngo?.id}`],
      });
      form.reset();
      toast({
        title: "Withdrawal request submitted",
        description: "Your request is being processed.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Failed to submit withdrawal request",
        variant: "destructive",
      });
    }
  };

  if (isLoadingNgo || isLoadingWithdrawals) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8">NGO Dashboard</h1>

        <DashboardStats ngoId={ngo?.id} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Request Withdrawal</CardTitle>
            </CardHeader>
            <CardContent>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <div>
                  <Label htmlFor="amount">Amount</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    {...form.register("amount", { valueAsNumber: true })}
                  />
                </div>
                <div>
                  <Label htmlFor="purpose">Purpose</Label>
                  <Textarea id="purpose" {...form.register("purpose")} />
                </div>
                <Button type="submit" disabled={form.formState.isSubmitting}>
                  {form.formState.isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit Request"
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Recent Withdrawals</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {withdrawals?.map((withdrawal) => (
                  <div
                    key={withdrawal.id}
                    className="p-4 border rounded-lg flex justify-between items-center"
                  >
                    <div>
                      <p className="font-medium">${withdrawal.amount}</p>
                      <p className="text-sm text-muted-foreground">
                        {withdrawal.purpose}
                      </p>
                    </div>
                    <Badge>{withdrawal.status}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
