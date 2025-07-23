import { Link } from "react-router";
import type { EquipmentRecord } from "~/data/equipment.zod";
import { type HeroRecord } from "~/data/hero.zod";
import { Card, CardTitle } from "../ui/card";
import HeroArtifactsCompact from "./HeroArtifactsCompact";
import HeroGlyphsCompact from "./HeroGlyphsCompact";
import HeroItemsCompact from "./HeroItemsCompact";
import HeroSkinsCompact from "./HeroSkinsCompact";

interface HeroTileProps {
  hero: HeroRecord;
  equipment: EquipmentRecord[];
}

export default function HeroTile({ hero, equipment }: HeroTileProps) {
  return (
    <Card className="w-full grid grid-cols-2 md:grid-cols-5">
      <Link to={`/heroes/${hero.slug}`} key={hero.slug} viewTransition>
        <div className="flex flex-col items-start p-2">
          <img
            src={`/images/heroes/${hero.slug}.png`}
            alt={hero.name}
            className="size-28 rounded-md"
          />
          <CardTitle className="flex flex-col">{hero.name}</CardTitle>
        </div>
      </Link>
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
}
