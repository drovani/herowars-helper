import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { HeroRecord } from "~/data/hero.zod";
import { generateSlug } from "~/lib/utils";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "../ui/hover-card";

interface HeroSkinsProps {
  hero: HeroRecord;
}

export default function HeroSkins({ hero }: HeroSkinsProps) {
  if (!hero.skins) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Skins</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {hero.skins.map((skin, index) => {
            return (
              <div key={index} className="flex items-center gap-4 p-4 border rounded-lg">
                <div className="flex-1">
                  <h4 className="font-medium">{skin.name}</h4>
                  <div className="flex items-center gap-2 mt-1">
                    <img src={`/images/stats/${generateSlug(skin.stat)}.png`} alt={skin.stat} className="w-6 h-6" />
                    <span className="text-sm text-muted-foreground capitalize">{skin.stat}</span>
                  </div>
                </div>
                <HoverCard>
                  <HoverCardTrigger asChild>
                    <img
                      src={`/images/heroes/skins/${hero.slug}-${generateSlug(skin.name, "-skin")}.png`}
                      alt={skin.name}
                      className="h-16"
                    />
                  </HoverCardTrigger>
                  <HoverCardContent>
                    <img
                      src={`/images/heroes/skins/${hero.slug}-${generateSlug(skin.name, "-skin")}.png`}
                      alt={skin.name}
                      className="h-96 w-auto"
                    />
                  </HoverCardContent>
                </HoverCard>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
