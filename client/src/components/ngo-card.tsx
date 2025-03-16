import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import type { Ngo } from "@shared/schema";
import { Award, MapPin } from "lucide-react";

interface NgoCardProps {
  ngo: Ngo;
}

export default function NgoCard({ ngo }: NgoCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="mb-2">{ngo.name}</CardTitle>
            <Badge>{ngo.sector}</Badge>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Award className="h-5 w-5" />
            <span>{ngo.impactScore}</span>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4 line-clamp-2">
          {ngo.description}
        </p>

        <div className="flex items-center gap-2 text-muted-foreground mb-4">
          <MapPin className="h-4 w-4" />
          <span className="text-sm">{ngo.location}</span>
        </div>

        <Link href={`/ngo/${ngo.id}`}>
          <Button className="w-full">
            View Details
          </Button>
        </Link>
      </CardContent>
    </Card>
  );
}