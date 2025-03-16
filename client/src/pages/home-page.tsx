import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/hooks/use-auth";
import NgoCard from "@/components/ngo-card";
import type { Ngo } from "@shared/schema";
import { Loader2 } from "lucide-react";

const sectors = ["All", "Education", "Health", "Environment", "Poverty", "Others"];

export default function HomePage() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [sector, setSector] = useState("All");

  const { data: ngos, isLoading } = useQuery<Ngo[]>({
    queryKey: ["/api/ngos"],
  });

  const filteredNgos = ngos?.filter((ngo) => {
    const matchesSearch = ngo.name.toLowerCase().includes(search.toLowerCase()) ||
      ngo.description.toLowerCase().includes(search.toLowerCase());
    const matchesSector = sector === "All" || ngo.sector === sector;
    return matchesSearch && matchesSector;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-border" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-8">
      <header className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Welcome {user?.username}</h1>
        <p className="text-muted-foreground">
          Support verified NGOs and track your impact through blockchain technology
        </p>
      </header>

      <div className="flex flex-col md:flex-row gap-4 mb-8">
        <Input
          placeholder="Search NGOs..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="md:w-96"
        />
        <Select value={sector} onValueChange={setSector}>
          <SelectTrigger className="w-full md:w-48">
            <SelectValue placeholder="Select sector" />
          </SelectTrigger>
          <SelectContent>
            {sectors.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {filteredNgos?.length === 0 ? (
        <div className="text-center text-muted-foreground py-8">
          No NGOs found matching your search criteria
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredNgos?.map((ngo) => (
            <NgoCard key={ngo.id} ngo={ngo} />
          ))}
        </div>
      )}
    </div>
  );
}
