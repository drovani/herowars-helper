import { ToggleGroup } from "@radix-ui/react-toggle-group";
import {
  ChevronLeftIcon,
  ChevronRightIcon,
  LayoutGridIcon,
  LayoutListIcon,
} from "lucide-react";
import { useState } from "react";
import { Link, useFetcher } from "react-router";
import HeroArtifactsCompact from "~/components/hero/HeroArtifactsCompact";
import HeroCard from "~/components/hero/HeroCard";
import HeroGlyphsCompact from "~/components/hero/HeroGlyphsCompact";
import HeroItemsCompact from "~/components/hero/HeroItemsCompact";
import HeroSkinsCompact from "~/components/hero/HeroSkinsCompact";
import { AddHeroButton } from "~/components/player/AddHeroButton";
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
  sortHeroRecords,
  transformCompleteHeroToRecord,
} from "~/lib/hero-transformations";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { HeroRepository } from "~/repositories/HeroRepository";
import { PlayerHeroRepository } from "~/repositories/PlayerHeroRepository";
import type { BasicHero } from "~/repositories/types";
import type { Route } from "./+types/index";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const url = new URL(request.url);
  const mode = url.searchParams.get("mode") || "cards";
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1"));
  const limit = 10; // For tiles pagination
  const offset = (page - 1) * limit;

  const heroRepo = new HeroRepository(request);

  let heroes: any[],
    sortedHeroes: any[],
    hasMoreResults = false;

  if (mode === "cards") {
    // Cards mode: Use lightweight query for minimal data
    const basicHeroesResult = await heroRepo.findAllBasic();

    if (basicHeroesResult.error) {
      throw new Response("Failed to load heroes", { status: 500 });
    }

    heroes = basicHeroesResult.data || [];
    sortedHeroes = heroes.sort((a, b) => a.order_rank - b.order_rank);
  } else {
    // Tiles mode: Use full relationships query with pagination
    const completeHeroesResult = await heroRepo.findAllWithRelationships({
      limit,
      offset,
    });

    if (completeHeroesResult.error) {
      throw new Response("Failed to load heroes", { status: 500 });
    }

    if (completeHeroesResult.data) {
      heroes = completeHeroesResult.data.map((hero) =>
        transformCompleteHeroToRecord(hero)
      );
      sortedHeroes = sortHeroRecords(heroes);
      hasMoreResults = completeHeroesResult.data.length === limit;
    } else {
      heroes = [];
      sortedHeroes = [];
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
    heroes: sortedHeroes,
    equipment,
    userCollection,
    mode,
    pagination:
      mode === "tiles"
        ? {
            currentPage: page,
            limit,
            hasMore: hasMoreResults,
          }
        : undefined,
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

export default function HeroesIndex({ loaderData }: Route.ComponentProps) {
  const {
    heroes,
    equipment,
    userCollection,
    mode: initialMode,
    pagination,
  } = loaderData;
  const { user } = useAuth();
  const fetcher = useFetcher();

  const [search, setSearch] = useState("");
  const [displayMode, setDisplayMode] = useQueryState<"cards" | "tiles">(
    "mode",
    (initialMode as "cards" | "tiles") || "cards"
  );
  const [currentPage, setCurrentPage] = useQueryState(
    "page",
    String(pagination?.currentPage || 1)
  );
  const isMobile = useIsMobile();

  const filteredHeroes = search
    ? heroes.filter((hero) =>
        hero.name.toLowerCase().includes(search.toLowerCase())
      )
    : heroes;

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
    equipment: typeof loaderData.equipment;
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
      <div className="flex justify-between gap-4">
        <Input
          placeholder="Search heroes"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-sm"
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
      {filteredHeroes.length ? (
        displayMode === "cards" ? (
          <div className="gap-2 grid grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {filteredHeroes.map((hero) => (
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
              {filteredHeroes.map((hero) => (
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
        <p>No heroes found.</p>
      )}

      {/* Pagination controls for tiles mode */}
      {displayMode === "tiles" && pagination && (
        <div className="flex justify-center gap-2 mt-6">
          <Button
            variant="outline"
            size="sm"
            disabled={parseInt(currentPage) <= 1}
            onClick={() => setCurrentPage(String(parseInt(currentPage) - 1))}
          >
            <ChevronLeftIcon className="size-4" />
            Previous
          </Button>
          <span className="flex items-center px-4 text-sm text-muted-foreground">
            Page {currentPage}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={!pagination.hasMore}
            onClick={() => setCurrentPage(String(parseInt(currentPage) + 1))}
          >
            Next
            <ChevronRightIcon className="size-4" />
          </Button>
        </div>
      )}
    </div>
  );
}
