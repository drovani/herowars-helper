// ABOUTME: Player roster page displays user's hero collection with management capabilities
// ABOUTME: Allows viewing, filtering, and managing personal hero collection including stars and equipment levels
import { useState } from "react";
import { useFetcher } from "react-router";
import { AddAllHeroesButton } from "~/components/player/AddAllHeroesButton";
import { HeroCollectionCard } from "~/components/player/HeroCollectionCard";
import { PlayerCollectionErrorBoundary } from "~/components/player/PlayerCollectionErrorBoundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { formatTitle } from "~/config/site";
import { useAuth } from "~/contexts/AuthContext";
import {
  getAuthenticatedUser,
  requireAuthenticatedUser,
} from "~/lib/auth/utils";
import { transformBasicHeroToRecord } from "~/lib/hero-transformations";
import { HeroRepository } from "~/repositories/HeroRepository";
import { PlayerHeroRepository } from "~/repositories/PlayerHeroRepository";
import type { PlayerHeroWithDetails } from "~/repositories/types";
import type { Route } from "./+types/roster";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const heroRepo = new HeroRepository(request);
  const playerHeroRepo = new PlayerHeroRepository(request);

  // Get authenticated user using universal utility
  const { user } = await getAuthenticatedUser(request);

  const heroesResult = await heroRepo.findAll();

  if (heroesResult.error) {
    throw new Response("Failed to load heroes", { status: 500 });
  }

  const heroes = heroesResult.data
    ? heroesResult.data.map((hero) => transformBasicHeroToRecord(hero))
    : [];

  // Load user's collection if authenticated
  let playerCollection: PlayerHeroWithDetails[] = [];
  if (user) {
    const collectionResult = await playerHeroRepo.findWithHeroDetails(user.id);
    if (!collectionResult.error && collectionResult.data) {
      playerCollection = collectionResult.data;
    }
  }

  return { heroes, playerCollection };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await requireAuthenticatedUser(request);

  const formData = await request.formData();
  const action = formData.get("action");
  const heroSlug = formData.get("heroSlug") as string;

  const playerHeroRepo = new PlayerHeroRepository(request);

  switch (action) {
    case "addHero": {
      const stars = parseInt(formData.get("stars") as string) || 1;
      const equipmentLevel =
        parseInt(formData.get("equipmentLevel") as string) || 1;

      const result = await playerHeroRepo.addHeroToCollection(user.id, {
        hero_slug: heroSlug,
        stars,
        equipment_level: equipmentLevel,
      });

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true, message: "Hero added to collection" };
    }

    case "updateStars": {
      const stars = parseInt(formData.get("stars") as string);

      const result = await playerHeroRepo.updateHeroProgress(
        user.id,
        heroSlug,
        { stars }
      );

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true, message: "Hero stars updated" };
    }

    case "updateEquipment": {
      const equipmentLevel = parseInt(formData.get("equipmentLevel") as string);

      const result = await playerHeroRepo.updateHeroProgress(
        user.id,
        heroSlug,
        { equipment_level: equipmentLevel }
      );

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true, message: "Hero equipment updated" };
    }

    case "removeHero": {
      const result = await playerHeroRepo.removeFromCollection(
        user.id,
        heroSlug
      );

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true, message: "Hero removed from collection" };
    }

    case "addAllHeroes": {
      const result = await playerHeroRepo.addAllHeroesToCollection(user.id);

      if (result.error) {
        // Handle different error types for user-friendly messages
        if (result.error.code === "BULK_ADD_PARTIAL" && result.data) {
          return {
            success: true,
            message: `Added ${result.data.addedCount} heroes to your collection. ${result.data.errorCount} heroes had errors.`,
            data: result.data,
          };
        } else {
          return { 
            error: result.error.message,
            code: result.error.code,
          };
        }
      }

      if (result.data) {
        if (result.data.addedCount === 0) {
          return {
            success: true,
            message: "All heroes are already in your collection!",
            data: result.data,
          };
        } else {
          return {
            success: true,
            message: `Successfully added ${result.data.addedCount} heroes to your collection!`,
            data: result.data,
          };
        }
      }

      return { error: "Unexpected error during bulk hero addition" };
    }

    default:
      return { error: "Invalid action" };
  }
};

export const meta = (_: Route.MetaArgs) => {
  return [{ title: formatTitle("Hero Roster") }];
};

export default function PlayerRoster({ loaderData }: Route.ComponentProps) {
  const { heroes, playerCollection } = loaderData;
  const { user, isLoading: authLoading } = useAuth();
  const fetcher = useFetcher();

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [factionFilter, setFactionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");

  // Bulk operation state
  const [bulkResult, setBulkResult] = useState<{
    success: boolean;
    message: string;
    data?: {
      totalHeroes: number;
      addedCount: number;
      skippedCount: number;
      errorCount: number;
    };
  } | null>(null);

  // Use real data from loader
  const collection = playerCollection || [];

  // Calculate how many heroes would be added
  const existingHeroSlugs = new Set(collection.map((ph) => ph.hero_slug));
  const heroesToAdd = heroes.filter((hero) => !existingHeroSlugs.has(hero.slug));
  const expectedAddCount = heroesToAdd.length;

  // Handle bulk hero addition
  const handleAddAllHeroes = () => {
    if (user?.id) {
      setBulkResult(null);
      fetcher.submit(
        { action: "addAllHeroes" },
        { method: "POST" }
      );
    }
  };

  // Process fetcher data for bulk operation results
  if (fetcher.data && fetcher.state === "idle" && !bulkResult) {
    if (fetcher.data.success || fetcher.data.error) {
      setBulkResult({
        success: !!fetcher.data.success,
        message: fetcher.data.message || fetcher.data.error,
        data: fetcher.data.data,
      });
    }
  }

  // Check if bulk operation is running
  const isBulkLoading = fetcher.state === "submitting" && 
    fetcher.formData?.get("action") === "addAllHeroes";

  // Show loading state while auth is initializing
  if (authLoading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <Card>
          <CardHeader>
            <CardTitle>Loading...</CardTitle>
            <CardDescription>Loading your hero collection.</CardDescription>
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
  const filteredCollection = collection.filter((item) => {
    const matchesSearch = item.hero.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesClass =
      classFilter === "all" || item.hero.class === classFilter;
    const matchesFaction =
      factionFilter === "all" || item.hero.faction === factionFilter;

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
        return (
          new Date(b.created_at || "").getTime() -
          new Date(a.created_at || "").getTime()
        );
      default:
        return 0;
    }
  });

  // Get unique classes and factions for filter options
  const uniqueClasses = [...new Set(heroes.map((h) => h.class))].sort();
  const uniqueFactions = [...new Set(heroes.map((h) => h.faction))].sort();

  return (
    <div className="max-w-6xl mx-auto p-6">
      <Card>
        <CardHeader>
          <CardTitle>Hero Roster ({collection.length})</CardTitle>
          <CardDescription>
            Manage your personal hero collection, track progress, and update
            hero development.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Bulk Actions */}
          <div className="flex items-center justify-between border-b pb-4">
            <div>
              <h3 className="text-lg font-medium">Quick Actions</h3>
              <p className="text-sm text-muted-foreground">
                Add all available heroes to your collection at once
              </p>
            </div>
            <AddAllHeroesButton
              disabled={!user || expectedAddCount === 0}
              onConfirm={handleAddAllHeroes}
              isLoading={isBulkLoading}
              result={bulkResult || undefined}
              expectedAddCount={expectedAddCount}
              className="min-w-fit"
            />
          </div>

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
                  {uniqueClasses.map((cls) => (
                    <SelectItem key={cls} value={cls} className="capitalize">
                      {cls}
                    </SelectItem>
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
                  {uniqueFactions.map((faction) => (
                    <SelectItem
                      key={faction}
                      value={faction}
                      className="capitalize"
                    >
                      {faction}
                    </SelectItem>
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
            <PlayerCollectionErrorBoundary>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sortedCollection.map((playerHero) => (
                  <HeroCollectionCard
                    key={playerHero.id}
                    playerHero={playerHero}
                    isUpdating={fetcher.state === "submitting"}
                    isRemoving={
                      fetcher.state === "submitting" &&
                      fetcher.formData?.get("action") === "removeHero" &&
                      fetcher.formData?.get("heroSlug") === playerHero.hero_slug
                    }
                    onUpdateStars={(stars) => {
                      if (user?.id) {
                        fetcher.submit(
                          {
                            action: "updateStars",
                            heroSlug: playerHero.hero_slug,
                            stars: stars.toString(),
                          },
                          { method: "POST" }
                        );
                      }
                    }}
                    onUpdateEquipment={(level) => {
                      if (user?.id) {
                        fetcher.submit(
                          {
                            action: "updateEquipment",
                            heroSlug: playerHero.hero_slug,
                            equipmentLevel: level.toString(),
                          },
                          { method: "POST" }
                        );
                      }
                    }}
                    onRemoveHero={() => {
                      if (user?.id) {
                        fetcher.submit(
                          {
                            action: "removeHero",
                            heroSlug: playerHero.hero_slug,
                          },
                          { method: "POST" }
                        );
                      }
                    }}
                  />
                ))}
              </div>
            </PlayerCollectionErrorBoundary>
          ) : (
            <div className="text-center py-12">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {collection.length === 0
                  ? "No Heroes in Collection"
                  : "No Heroes Match Your Filters"}
              </h3>
              <p className="text-gray-500 mb-4">
                {collection.length === 0
                  ? "Start building your hero roster by adding heroes from the hero catalog."
                  : "Try adjusting your search or filter criteria."}
              </p>
              {collection.length === 0 && (
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
