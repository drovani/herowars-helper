import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { LayoutGridIcon, LayoutListIcon } from "lucide-react";
import { useState } from "react";
import HeroCard from "~/components/hero/HeroCard";
import HeroTile from "~/components/hero/HeroTile";
import { Input } from "~/components/ui/input";
import { ToggleGroupItem } from "~/components/ui/toggle-group";
import { useIsMobile } from "~/hooks/useIsMobile";
import { useQueryState } from "~/hooks/useQueryState";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { HeroRepository } from "~/repositories/HeroRepository";
import { transformCompleteHeroToRecord, transformBasicHeroToRecord, sortHeroRecords } from "~/lib/hero-transformations";
import type { Route } from "./+types/index";

export const loader = async ({ request }: Route.LoaderArgs) => {
  const heroRepo = new HeroRepository(request);
  const heroesResult = await heroRepo.findAll();
  
  if (heroesResult.error) {
    throw new Response("Failed to load heroes", { status: 500 });
  }

  // Transform heroes to HeroRecord format
  const heroes = heroesResult.data ? await Promise.all(
    heroesResult.data.map(async (hero) => {
      const completeHeroResult = await heroRepo.findWithAllData(hero.slug);
      if (completeHeroResult.data) {
        return transformCompleteHeroToRecord(completeHeroResult.data);
      }
      // Fallback to basic hero if complete data is not available
      return transformBasicHeroToRecord(hero);
    })
  ) : [];

  const sortedHeroes = sortHeroRecords(heroes);

  const equipmentRepo = new EquipmentRepository(request);
  const equipmentResult = await equipmentRepo.getAllAsJson();

  if (equipmentResult.error) {
    throw new Response("Failed to load equipment", { status: 500 });
  }

  return { heroes: sortedHeroes, equipment: equipmentResult.data?.filter(eq => eq.type === "equipable") || [] };
};

export default function HeroesIndex({ loaderData }: Route.ComponentProps) {
  const { heroes, equipment } = loaderData;

  const [search, setSearch] = useState("");
  const [displayMode, setDisplayMode] = useQueryState<"cards" | "tiles">("mode", "cards");
  const isMobile = useIsMobile();

  const filteredHeroes = search
    ? heroes.filter((hero) => hero.name.toLowerCase().includes(search.toLowerCase()))
    : heroes;

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
            onValueChange={(value) => setDisplayMode(value as "cards" | "tiles")}
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
              <HeroCard hero={hero} key={hero.slug} />
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
                <HeroTile hero={hero} key={hero.slug} equipment={equipment} />
              ))}
            </div>
          </>
        ) : (
          <p>Unknown display mode {displayMode}</p>
        )
      ) : (
        <p>No heroes found.</p>
      )}
    </div>
  );
}
