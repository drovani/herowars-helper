import { ToggleGroup } from "@radix-ui/react-toggle-group";
import { LayoutGridIcon, LayoutListIcon } from "lucide-react";
import { useState } from "react";
import HeroCard from "~/components/hero/HeroCard";
import HeroTile from "~/components/hero/HeroTile";
import { Input } from "~/components/ui/input";
import { ToggleGroupItem } from "~/components/ui/toggle-group";
import { useIsMobile } from "~/hooks/useIsMobile";
import { useQueryState } from "~/hooks/useQueryState";
import EquipmentDataService from "~/services/EquipmentDataService";
import HeroDataService from "~/services/HeroDataService";
import type { Route } from "./+types/index";

export const loader = async (_: Route.LoaderArgs) => {
  const heroes = await HeroDataService.getAll();
  const equipment = await EquipmentDataService.getEquipableEquipment();

  return { heroes, equipment };
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
