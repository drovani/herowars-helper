import { ToggleGroup } from "@radix-ui/react-toggle-group";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutGridIcon,
  LayoutListIcon,
} from "lucide-react";
import { Suspense, useState, useMemo } from "react";
import { Await, Link, useFetcher, useNavigate } from "react-router";
import { ActiveFilterChips } from "~/components/hero/ActiveFilterChips";
import HeroArtifactsCompact from "~/components/hero/HeroArtifactsCompact";
import HeroCard from "~/components/hero/HeroCard";
import { HeroFilters } from "~/components/hero/HeroFilters";
import HeroGlyphsCompact from "~/components/hero/HeroGlyphsCompact";
import HeroItemsCompact from "~/components/hero/HeroItemsCompact";
import { HeroSortControls } from "~/components/hero/HeroSortControls";
import HeroSkinsCompact from "~/components/hero/HeroSkinsCompact";
import { AddHeroButton } from "~/components/player/AddHeroButton";
import { HeroIndexSkeleton } from "~/components/skeletons/HeroIndexSkeleton";
import { Button } from "~/components/ui/button";
import { Card } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { ToggleGroupItem } from "~/components/ui/toggle-group";
import { useAuth } from "~/contexts/AuthContext";
import { useIsMobile } from "~/hooks/useIsMobile";
import { useQueryState } from "~/hooks/useQueryState";
import {
  getAuthenticatedUser,
  requireAuthenticatedUser,
} from "~/lib/auth/utils";
import {
  filterHeroes,
  parseFilterParams,
  createFilterParams,
} from "~/lib/hero-filtering";
import type { HeroFilters as HeroFiltersType } from "~/lib/hero-filtering";
import {
  sortHeroes,
  parseSortParams,
  createSortParams,
} from "~/lib/hero-sorting";
import type { SortOptions } from "~/lib/hero-sorting";
import {
  sortHeroRecords,
  transformCompleteHeroToRecord,
} from "~/lib/hero-transformations";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { HeroRepository } from "~/repositories/HeroRepository";
import { PlayerHeroRepository } from "~/repositories/PlayerHeroRepository";
import type { BasicHero } from "~/repositories/types";
import type { Route } from "./+types/index";

async function loadHeroesData(request: Request) {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "cards";

  const heroRepo = new HeroRepository(request);

  let heroes: any[];

  if (mode === "cards") {
    // Cards mode: Use lightweight query for minimal data
    const basicHeroesResult = await heroRepo.findAllBasic();

    if (basicHeroesResult.error) {
      throw new Response("Failed to load heroes", { status: 500 });
    }

    heroes = basicHeroesResult.data || [];
  } else {
    // Tiles mode: Load all heroes with full relationships (no pagination, we'll handle client-side)
    const completeHeroesResult = await heroRepo.findAllWithRelationships();

    if (completeHeroesResult.error) {
      throw new Response("Failed to load heroes", { status: 500 });
    }

    if (completeHeroesResult.data) {
      heroes = completeHeroesResult.data.map((hero) =>
        transformCompleteHeroToRecord(hero)
      );
    } else {
      heroes = [];
    }
  }

  // Only load equipment for tiles mode (cards don't need it)
  let equipment: any[] = [];
  if (mode === "tiles") {
    const equipmentRepo = new EquipmentRepository(request);
    const equipmentResult = await equipmentRepo.getAllAsJson();

    if (equipmentResult.error) {
      throw new Response("Failed to load equipment", { status: 500 });
    }

    equipment =
      equipmentResult.data?.filter((eq) => eq.type === "equipable") || [];
  }

  // Check user's collection if authenticated
  const { user } = await getAuthenticatedUser(request);
  let userCollection: string[] = [];

  if (user) {
    const playerHeroRepo = new PlayerHeroRepository(request);
    const collectionResult = await playerHeroRepo.findByUserId(user.id);
    if (!collectionResult.error && collectionResult.data) {
      userCollection = collectionResult.data.map((ph) => ph.hero_slug);
    }
  }

  return {
    heroes,
    equipment,
    userCollection,
    mode,
  };
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {
    heroesData: loadHeroesData(request),
  };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const user = await requireAuthenticatedUser(request);

  const formData = await request.formData();
  const action = formData.get("action");
  const heroSlug = formData.get("heroSlug") as string;

  if (action === "addHero") {
    const playerHeroRepo = new PlayerHeroRepository(request);
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

  return { error: "Invalid action" };
};

function HeroesContent({
  heroes,
  equipment,
  userCollection,
  mode: initialMode,
}: {
  heroes: any[];
  equipment: any[];
  userCollection: string[];
  mode: string;
}) {
  const { user } = useAuth();
  const fetcher = useFetcher();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  // Parse initial filters and sort from URL
  const initialFilters = useMemo(() => {
    if (typeof window !== "undefined") {
      return parseFilterParams(new URLSearchParams(window.location.search));
    }
    return {};
  }, []);

  const initialSort = useMemo(() => {
    if (typeof window !== "undefined") {
      return parseSortParams(new URLSearchParams(window.location.search));
    }
    return { field: "order_rank" as const, direction: "asc" as const };
  }, []);

  const [search, setSearch] = useState(initialFilters.search || "");
  const [displayMode, setDisplayMode] = useQueryState<"cards" | "tiles">(
    "mode",
    (initialMode as "cards" | "tiles") || "cards"
  );
  const [filters, setFilters] = useState<HeroFiltersType>(initialFilters);
  const [sortOptions, setSortOptions] = useState<SortOptions>(initialSort);

  // Update URL when filters or sort changes
  const updateURL = (
    newFilters: HeroFiltersType,
    newSort: SortOptions,
    newSearch: string
  ) => {
    const params = new URLSearchParams(window.location.search);

    // Clear existing filter and sort params
    const keysToRemove: string[] = [];
    params.forEach((_, key) => {
      if (
        key !== "mode" &&
        key !== "page" &&
        !key.startsWith("_")
      ) {
        keysToRemove.push(key);
      }
    });
    keysToRemove.forEach((key) => params.delete(key));

    // Add filter params
    const filterParams = createFilterParams(newFilters);
    filterParams.forEach((value, key) => params.set(key, value));

    // Add sort params
    const sortParams = createSortParams(newSort);
    sortParams.forEach((value, key) => params.set(key, value));

    // Add search param
    if (newSearch) {
      params.set("search", newSearch);
    }

    // Navigate to new URL
    navigate(`?${params.toString()}`, { replace: true });
  };

  // Apply filters and sorting
  const processedHeroes = useMemo(() => {
    // Start with all heroes
    let result = [...heroes];

    // Apply search
    const searchFilters = { ...filters, search };

    // Apply filters
    result = filterHeroes(result, searchFilters, userCollection);

    // Apply sorting
    result = sortHeroes(result, sortOptions);

    return result;
  }, [heroes, filters, search, sortOptions, userCollection]);

  // Handle filter changes
  const handleFiltersChange = (newFilters: HeroFiltersType) => {
    setFilters(newFilters);
    updateURL(newFilters, sortOptions, search);
  };

  // Handle sort changes
  const handleSortChange = (newSort: SortOptions) => {
    setSortOptions(newSort);
    updateURL(filters, newSort, search);
  };

  // Handle search changes
  const handleSearchChange = (newSearch: string) => {
    setSearch(newSearch);
    updateURL(filters, sortOptions, newSearch);
  };

  const HeroCardWithButton = ({
    hero,
  }: {
    hero: BasicHero | (typeof heroes)[0];
  }) => {
    const isSubmittingThisHero =
      fetcher.state === "submitting" &&
      fetcher.formData?.get("heroSlug") === hero.slug;
    const isOptimisticallyInCollection =
      userCollection.includes(hero.slug) ||
      (isSubmittingThisHero && fetcher.formData?.get("action") === "addHero");

    return (
      <div className="relative group size-28">
        <HeroCard hero={hero} />
        {user && (
          <div className="absolute top-1 right-1 opacity-0 group-hover:opacity-100 transition-opacity duration-100">
            <AddHeroButton
              heroSlug={hero.slug}
              isInCollection={isOptimisticallyInCollection}
              isLoading={isSubmittingThisHero}
              onAddHero={(heroSlug) => {
                fetcher.submit(
                  {
                    action: "addHero",
                    heroSlug: heroSlug,
                    stars: "1",
                    equipmentLevel: "1",
                  },
                  { method: "POST" }
                );
              }}
              size="sm"
            />
          </div>
        )}
      </div>
    );
  };

  const HeroTileWithButton = ({
    hero,
    equipment,
  }: {
    hero: any;
    equipment: any[];
  }) => {
    const isSubmittingThisHero =
      fetcher.state === "submitting" &&
      fetcher.formData?.get("heroSlug") === hero.slug;
    const isOptimisticallyInCollection =
      userCollection.includes(hero.slug) ||
      (isSubmittingThisHero && fetcher.formData?.get("action") === "addHero");

    // Only render tiles if hero has complete data (artifacts, skins, etc.)
    if (!hero.artifacts || !hero.skins || !hero.glyphs || !hero.items) {
      return null;
    }

    return (
      <Card className="w-full grid grid-cols-2 md:grid-cols-5">
        <div className="flex flex-col items-start p-2">
          <Link to={`/heroes/${hero.slug}`} key={hero.slug} viewTransition>
            <img
              src={`/images/heroes/${hero.slug}.png`}
              alt={hero.name}
              className="size-28 rounded-md"
            />
          </Link>
          <div className="flex flex-col items-start">
            <Link to={`/heroes/${hero.slug}`} key={hero.slug} viewTransition>
              <div className="flex flex-col font-semibold">{hero.name}</div>
            </Link>
            {user && (
              <div className="mt-2">
                <AddHeroButton
                  heroSlug={hero.slug}
                  isInCollection={isOptimisticallyInCollection}
                  isLoading={isSubmittingThisHero}
                  onAddHero={(heroSlug) => {
                    fetcher.submit(
                      {
                        action: "addHero",
                        heroSlug: heroSlug,
                        stars: "1",
                        equipmentLevel: "1",
                      },
                      { method: "POST" }
                    );
                  }}
                  size="sm"
                />
              </div>
            )}
          </div>
        </div>
        <HeroItemsCompact
          items={hero.items}
          equipment={equipment}
          className="bg-muted p-2"
        />
        <HeroSkinsCompact
          skins={hero.skins}
          heroSlug={hero.slug}
          className="p-2"
        />
        <HeroArtifactsCompact
          artifacts={hero.artifacts}
          main_stat={hero.main_stat}
          className="bg-muted p-2"
        />
        <HeroGlyphsCompact glyphs={hero.glyphs} className="p-2" />
      </Card>
    );
  };

  return (
    <div className="flex flex-col gap-4">
      {/* Search, Filters, and Sort Controls */}
      <div className="flex flex-col gap-4 sm:flex-row sm:justify-between">
        <div className="flex flex-col gap-2 flex-1">
          <div className="flex gap-2">
            <Input
              placeholder="Search heroes"
              value={search}
              onChange={(e) => handleSearchChange(e.target.value)}
              className="w-full max-w-sm"
            />
            <HeroFilters
              filters={filters}
              onFiltersChange={handleFiltersChange}
              showCollectionFilter={!!user}
            />
            {!isMobile && (
              <ToggleGroup
                type="single"
                value={displayMode}
                onValueChange={(value) =>
                  setDisplayMode(value as "cards" | "tiles")
                }
              >
                <ToggleGroupItem value="cards">
                  <LayoutGridIcon />
                </ToggleGroupItem>
                <ToggleGroupItem value="tiles">
                  <LayoutListIcon />
                </ToggleGroupItem>
              </ToggleGroup>
            )}
          </div>
          <ActiveFilterChips
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </div>
        <div className="flex items-start">
          <HeroSortControls
            sortOptions={sortOptions}
            onSortChange={handleSortChange}
          />
        </div>
      </div>

      {/* Results count */}
      <div className="text-sm text-muted-foreground">
        Showing {processedHeroes.length} of {heroes.length} heroes
      </div>

      {/* Hero grid/list */}
      {processedHeroes.length ? (
        displayMode === "cards" ? (
          <div className="gap-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {processedHeroes.map((hero) => (
              <HeroCardWithButton hero={hero} key={hero.slug} />
            ))}
          </div>
        ) : displayMode === "tiles" ? (
          <>
            <div className="grid grid-cols-5 text-center font-medium sticky">
              <div>Hero</div>
              <div className="bg-muted rounded-t-md">Equipment</div>
              <div>Skins</div>
              <div className="bg-muted rounded-t-md">Artifacts</div>
              <div>Glyphs</div>
            </div>
            <div className="flex flex-col gap-4">
              {processedHeroes.map((hero) => (
                <HeroTileWithButton
                  hero={hero}
                  key={hero.slug}
                  equipment={equipment}
                />
              ))}
            </div>
          </>
        ) : (
          <p>Unknown display mode {displayMode}</p>
        )
      ) : (
        <p>No heroes found matching your filters.</p>
      )}
    </div>
  );
}

export default function HeroesIndex({ loaderData }: Route.ComponentProps) {
  return (
    <Suspense fallback={<HeroIndexSkeleton />}>
      <Await resolve={loaderData?.heroesData}>
        {(data: {
          heroes: any[];
          equipment: any[];
          userCollection: string[];
          mode: string;
        }) => (
          <HeroesContent
            heroes={data.heroes}
            equipment={data.equipment}
            userCollection={data.userCollection}
            mode={data.mode}
          />
        )}
      </Await>
    </Suspense>
  );
}
