// ABOUTME: Player roster page displays user's hero collection with management capabilities
// ABOUTME: Allows viewing, filtering, and managing personal hero collection including stars and equipment levels
import { useAuth } from "~/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
import { Label } from "~/components/ui/label";
import { HeroCollectionCard } from "~/components/player/HeroCollectionCard";
import { formatTitle } from "~/config/site";
import { HeroRepository } from "~/repositories/HeroRepository";
import { transformBasicHeroToRecord } from "~/lib/hero-transformations";
import { useState } from "react";
import type { Route } from "./+types/roster";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const heroRepo = new HeroRepository(request);
  const heroesResult = await heroRepo.findAll();
  
  if (heroesResult.error) {
    throw new Response("Failed to load heroes", { status: 500 });
  }

  const heroes = heroesResult.data ? 
    heroesResult.data.map(hero => transformBasicHeroToRecord(hero)) : [];

  return { heroes };
};

export const action = async (_: Route.ActionArgs) => {
  return {};
};

export const meta = (_: Route.MetaArgs) => {
  return [{ title: formatTitle('Hero Roster') }];
};

export default function PlayerRoster({ loaderData }: Route.ComponentProps) {
  const { heroes } = loaderData;
  const { user, isLoading: authLoading } = useAuth();
  
  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [factionFilter, setFactionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Mock collection data - TODO: Replace with actual data from PlayerHeroRepository
  const mockCollection = [
    {
      id: "1",
      user_id: "user1",
      hero_slug: "astaroth",
      stars: 5,
      equipment_level: 12,
      created_at: "2024-01-15T10:00:00Z",
      updated_at: "2024-01-15T10:00:00Z",
      hero: heroes.find(h => h.slug === "astaroth")!
    },
    {
      id: "2", 
      user_id: "user1",
      hero_slug: "aurora",
      stars: 3,
      equipment_level: 8,
      created_at: "2024-01-16T14:30:00Z",
      updated_at: "2024-01-16T14:30:00Z",
      hero: heroes.find(h => h.slug === "aurora")!
    }
  ].filter(item => item.hero); // Filter out undefined heroes

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>
              Loading your hero collection.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="animate-pulse space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="h-48 bg-gray-200 rounded"></div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Required</CardTitle>
            <CardDescription>
              You must be logged in to view your hero roster.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  // Filter collection based on search and filters
  const filteredCollection = mockCollection.filter(item => {
    const matchesSearch = item.hero.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesClass = classFilter === "all" || item.hero.class === classFilter;
    const matchesFaction = factionFilter === "all" || item.hero.faction === factionFilter;
    
    return matchesSearch && matchesClass && matchesFaction;
  });

  // Sort collection
  const sortedCollection = [...filteredCollection].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.hero.name.localeCompare(b.hero.name);
      case "stars":
        return b.stars - a.stars;
      case "equipment":
        return b.equipment_level - a.equipment_level;
      case "recent":
        return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
      default:
        return 0;
    }
  });

  // Get unique classes and factions for filter options
  const uniqueClasses = [...new Set(heroes.map(h => h.class))].sort();
  const uniqueFactions = [...new Set(heroes.map(h => h.faction))].sort();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Roster ({mockCollection.length})</CardTitle>
          <CardDescription>
            Manage your personal hero collection, track progress, and update hero development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Filters and Search */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Search Heroes</Label>
              <Input
                id="search"
                placeholder="Search by name..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            
            <div>
              <Label htmlFor="class-filter">Filter by Class</Label>
              <Select value={classFilter} onValueChange={setClassFilter}>
                <SelectTrigger id="class-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Classes</SelectItem>
                  {uniqueClasses.map(cls => (
                    <SelectItem key={cls} value={cls}>{cls}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="faction-filter">Filter by Faction</Label>
              <Select value={factionFilter} onValueChange={setFactionFilter}>
                <SelectTrigger id="faction-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Factions</SelectItem>
                  {uniqueFactions.map(faction => (
                    <SelectItem key={faction} value={faction}>{faction}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="sort-by">Sort By</Label>
              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger id="sort-by">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="name">Name</SelectItem>
                  <SelectItem value="stars">Stars</SelectItem>
                  <SelectItem value="equipment">Equipment Level</SelectItem>
                  <SelectItem value="recent">Recently Added</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Hero Collection Grid */}
          {sortedCollection.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedCollection.map((playerHero) => (
                <HeroCollectionCard
                  key={playerHero.id}
                  playerHero={playerHero}
                  onUpdateStars={(stars) => {
                    // TODO: Implement star update
                    console.log(`Update ${playerHero.hero.name} stars to ${stars}`);
                  }}
                  onUpdateEquipment={(level) => {
                    // TODO: Implement equipment update
                    console.log(`Update ${playerHero.hero.name} equipment to level ${level}`);
                  }}
                  onRemoveHero={() => {
                    // TODO: Implement hero removal
                    console.log(`Remove ${playerHero.hero.name} from collection`);
                  }}
                />
              ))}
            </div>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {mockCollection.length === 0 
                  ? "No Heroes in Collection" 
                  : "No Heroes Match Your Filters"
                }
              </h3>
              <p className="text-gray-500 mb-4">
                {mockCollection.length === 0 
                  ? "Start building your hero roster by adding heroes from the hero catalog."
                  : "Try adjusting your search or filter criteria."
                }
              </p>
              {mockCollection.length === 0 && (
                <div className="text-sm text-gray-400">
                  Visit the Heroes page to add heroes to your collection.
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}