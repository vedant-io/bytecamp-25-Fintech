import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import DonationForm from "@/components/donation-form";
import { Loader2, Mail, Phone, MapPin, Award } from "lucide-react";
import type { Ngo } from "@shared/schema";

interface NgoPageProps {
  id: string;
}

export default function NgoPage({ id }: NgoPageProps) {
  const ngoId = parseInt(id);

  const {
    data: ngo,
    isLoading,
    isError,
  } = useQuery<Ngo>({
    queryKey: [`/api/ngos/${ngoId}`],
    queryFn: async () => {
      const res = await fetch(`/api/ngos/${ngoId}`);
      if (!res.ok) {
        throw new Error("Failed to fetch NGO data");
      }
      return res.json();
    },
    enabled: !isNaN(ngoId),
  });

  if (isNaN(ngoId)) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-red-500">Invalid NGO ID</h1>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  if (isError || !ngo) {
    return (
      <div className="min-h-screen bg-background p-8">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-2xl font-bold text-red-500">NGO not found</h1>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-6xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div>
                    <CardTitle className="text-3xl mb-2">{ngo.name}</CardTitle>
                    <Badge>{ngo.sector}</Badge>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Award className="h-5 w-5" />
                      <span>Impact Score: {ngo.impactScore}</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground mb-6">{ngo.description}</p>

                <div className="space-y-4">
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Mail className="h-5 w-5" />
                    <span>{ngo.contactEmail}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Phone className="h-5 w-5" />
                    <span>{ngo.contactPhone}</span>
                  </div>
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <MapPin className="h-5 w-5" />
                    <span>{ngo.location}</span>
                  </div>
                </div>

                <div className="mt-6 p-4 bg-muted rounded-lg">
                  <h3 className="font-semibold mb-2">Registration Details</h3>
                  <p>Registration Number: {ngo.registrationNumber}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div>
            <DonationForm ngoId={ngo.id} />
          </div>
        </div>
      </div>
    </div>
  );
}

