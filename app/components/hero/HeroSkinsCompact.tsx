import type { ClassValue } from "clsx";
import type { HeroRecord } from "~/data/hero.zod";
import { cn, generateSlug } from "~/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

interface HeroSkinsProps {
  skins: HeroRecord["skins"];
  heroSlug: string;
  className?: ClassValue;
}

export default function HeroSkinsCompact({
  skins,
  heroSlug,
  className,
}: HeroSkinsProps) {
  if (!skins) return <div className={cn(className)} />;

  const skinsSorts = skins.sort((a, b) =>
    a.name === "Default Skin"
      ? -1
      : b.name === "Default Skin"
      ? 1
      : a.name.localeCompare(b.name)
  );

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      {skinsSorts.map((skin) => (
        <HoverCard key={skin.name}>
          <HoverCardTrigger asChild>
            <div
              key={skin.name}
              className="flex gap-2 cursor-pointer hover:bg-muted rounded-md p-1"
            >
              <div className="flex-1">
                {skin.name.replace(" Skin", "")} {skin.has_plus && "(+)"}
              </div>
              <img
                src={`/images/stats/${generateSlug(skin.stat)}.png`}
                alt={skin.stat}
                className="size-6"
              />
            </div>
          </HoverCardTrigger>
          <HoverCardContent>
            <div>
              <h4 className="font-medium">
                {skin.name} {skin.has_plus && " & (+) variant"}
              </h4>
              <div className="flex items-center gap-2 mt-1">
                <img
                  src={`/images/stats/${generateSlug(skin.stat)}.png`}
                  alt={skin.stat}
                  className="w-6 h-6"
                />
                <span className="text-sm text-muted-foreground capitalize">
                  {skin.stat}
                </span>
              </div>
            </div>
            <div className="flex flex-col md:flex-row gap-2">
              <img
                src={`/images/heroes/skins/${heroSlug}-${generateSlug(
                  skin.name,
                  "-skin"
                )}.png`}
                alt={skin.name}
                className="h-48 md:h-72 lg:h-96 w-auto"
              />
              {skin.has_plus && (
                <img
                  src={`/images/heroes/skins/${heroSlug}-${generateSlug(
                    skin.name,
                    "-skin"
                  )}-plus.png`}
                  alt={`${skin.name} (+) variant`}
                  className="h-48 md:h-72 lg:h-96 w-auto"
                />
              )}
            </div>
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
}
