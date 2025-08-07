// ABOUTME: Roster layout component handles hero collection UI structure and state management
// ABOUTME: Provides sidebar navigation and detail view container with responsive layout
import { useState } from "react";
import { Outlet, useFetcher, useParams, useNavigate } from "react-router";
import { HeroDetailNavigation } from "~/components/player/HeroDetailNavigation";
import { HeroListSidebar } from "~/components/player/HeroListSidebar";
import { PlayerCollectionErrorBoundary } from "~/components/player/PlayerCollectionErrorBoundary";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
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
import type { Route } from "./+types/layout";

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
      const level = parseInt(formData.get("level") as string) || 1;
      const talismanLevel =
        parseInt(formData.get("talismanLevel") as string) || 0;

      const result = await playerHeroRepo.addHeroToCollection(user.id, {
        hero_slug: heroSlug,
        stars,
        equipment_level: equipmentLevel,
        level,
        talisman_level: talismanLevel,
      });

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true, message: "Hero added to collection" };
    }

    case "updateHero": {
      const updates: any = {};
      const stars = formData.get("stars");
      const equipmentLevel = formData.get("equipmentLevel");
      const level = formData.get("level");
      const talismanLevel = formData.get("talismanLevel");

      if (stars) updates.stars = parseInt(stars as string);
      if (equipmentLevel)
        updates.equipment_level = parseInt(equipmentLevel as string);
      if (level) updates.level = parseInt(level as string);
      if (talismanLevel)
        updates.talisman_level = parseInt(talismanLevel as string);

      const result = await playerHeroRepo.updateHeroProgress(
        user.id,
        heroSlug,
        updates
      );

      if (result.error) {
        return { error: result.error.message };
      }

      return { success: true, message: "Hero updated" };
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

    default:
      return { error: "Invalid action" };
  }
};

export const meta = (_: Route.MetaArgs) => {
  return [{ title: formatTitle("Hero Roster") }];
};

export default function RosterLayout({ loaderData }: Route.ComponentProps) {
  const { heroes, playerCollection } = loaderData;
  const { user, isLoading: authLoading } = useAuth();
  const fetcher = useFetcher();
  const params = useParams();
  const navigate = useNavigate();

  // Filter and sort states
  const [searchTerm, setSearchTerm] = useState("");
  const [classFilter, setClassFilter] = useState("all");
  const [factionFilter, setFactionFilter] = useState("all");
  const [sortBy, setSortBy] = useState("name");
  const [activeView, setActiveView] = useState("hero");

  // Use real data from loader
  const collection = playerCollection || [];

  // Get selected hero from URL params
  const selectedHeroSlug = params.heroSlug || null;
  const selectedHero = selectedHeroSlug
    ? collection.find((h) => h.hero_slug === selectedHeroSlug)
    : null;

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

  const handleSelectHero = (heroSlug: string) => {
    navigate(`/player/roster/${heroSlug}`);
  };

  const handleViewChange = (view: string) => {
    setActiveView(view);
    if (selectedHeroSlug) {
      navigate(`/player/roster/${selectedHeroSlug}/${view}`);
    }
  };

  const handleHeroUpdate = (updates: {
    level?: number;
    talisman_level?: number;
    stars?: number;
    equipment_level?: number;
  }) => {
    if (selectedHeroSlug && user?.id) {
      const formData = new FormData();
      formData.append("action", "updateHero");
      formData.append("heroSlug", selectedHeroSlug);

      if (updates.level !== undefined) {
        formData.append("level", updates.level.toString());
      }
      if (updates.talisman_level !== undefined) {
        formData.append("talismanLevel", updates.talisman_level.toString());
      }
      if (updates.stars !== undefined) {
        formData.append("stars", updates.stars.toString());
      }
      if (updates.equipment_level !== undefined) {
        formData.append("equipmentLevel", updates.equipment_level.toString());
      }

      fetcher.submit(formData, { method: "POST" });
    }
  };

  return (
    <div className="flex h-screen">
      {/* Desktop Layout */}
      <div className="hidden lg:flex w-full">
        {/* Hero List Sidebar */}
        <div className="w-80 flex-shrink-0">
          <HeroListSidebar
            heroes={collection}
            selectedHeroSlug={selectedHeroSlug}
            onSelectHero={handleSelectHero}
            sortBy={sortBy}
            onSortChange={setSortBy}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            classFilter={classFilter}
            onClassFilterChange={setClassFilter}
            factionFilter={factionFilter}
            onFactionFilterChange={setFactionFilter}
          />
        </div>

        {/* Detail View */}
        <div className="flex-1 flex">
          <div className="flex-1">
            <PlayerCollectionErrorBoundary>
              <Outlet
                context={{
                  selectedHero,
                  onHeroUpdate: handleHeroUpdate,
                  isUpdating: fetcher.state === "submitting",
                  activeView,
                }}
              />
            </PlayerCollectionErrorBoundary>
          </div>

          {/* Navigation */}
          {selectedHero && (
            <div className="w-20 flex-shrink-0">
              <HeroDetailNavigation
                activeView={activeView}
                onViewChange={handleViewChange}
              />
            </div>
          )}
        </div>
      </div>

      {/* Mobile Layout */}
      <div className="lg:hidden flex flex-col w-full">
        {/* Hero Selector Row - Mobile */}
        <div className="bg-white border-b p-2">
          <div className="overflow-x-auto">
            <div className="flex gap-2 pb-2">
              {collection.map((playerHero) => (
                <button
                  key={playerHero.id}
                  onClick={() => handleSelectHero(playerHero.hero_slug)}
                  className={`flex-shrink-0 p-2 rounded-lg border-2 transition-colors ${
                    playerHero.hero_slug === selectedHeroSlug
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                >
                  <img
                    src={`/images/heroes/${playerHero.hero.slug}.png`}
                    alt={playerHero.hero.name}
                    className="size-12 rounded object-cover"
                  />
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Detail View */}
        <div className="flex-1 overflow-hidden">
          <PlayerCollectionErrorBoundary>
            <Outlet
              context={{
                selectedHero,
                onHeroUpdate: handleHeroUpdate,
                isUpdating: fetcher.state === "submitting",
                activeView,
              }}
            />
          </PlayerCollectionErrorBoundary>
        </div>

        {/* Mobile Navigation */}
        {selectedHero && (
          <HeroDetailNavigation
            activeView={activeView}
            onViewChange={handleViewChange}
          />
        )}
      </div>
    </div>
  );
}