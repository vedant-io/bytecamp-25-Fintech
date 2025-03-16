import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Loader2, Users, TrendingUp, ArrowUpRight } from "lucide-react";
import type { Donation } from "@shared/schema";

interface DashboardStatsProps {
  ngoId?: number;
}

export default function DashboardStats({ ngoId }: DashboardStatsProps) {
  const { data: donations, isLoading } = useQuery<Donation[]>({
    queryKey: [`/api/donations/ngo/${ngoId}`],
    enabled: !!ngoId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-48">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;
  const uniqueDonors = new Set(donations?.map(d => d.donorId)).size;
  const recentTrend = donations
    ?.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .reduce((sum, d) => sum + Number(d.amount), 0) || 0;

  return (
    <div className="grid gap-4 md:grid-cols-3">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Total Donations</CardTitle>
          <TrendingUp className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${totalDonations.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Lifetime donation amount
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Unique Donors</CardTitle>
          <Users className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{uniqueDonors}</div>
          <p className="text-xs text-muted-foreground">
            Total number of donors
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Recent Activity</CardTitle>
          <ArrowUpRight className="h-4 w-4 text-muted-foreground" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">${recentTrend.toFixed(2)}</div>
          <p className="text-xs text-muted-foreground">
            Last 5 donations total
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
