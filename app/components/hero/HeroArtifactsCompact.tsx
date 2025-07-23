import type { ClassValue } from "clsx";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "~/components/ui/hover-card";
import type { HeroRecord } from "~/data/hero.zod";
import { ArtifactBookStats, HeroMainStat } from "~/data/ReadonlyArrays";
import { cn, generateSlug } from "~/lib/utils";

interface HeroArtifactsProps {
  artifacts: HeroRecord["artifacts"];
  main_stat: HeroMainStat;
  className?: ClassValue;
}

function HeroArtifactMini({
  artifactName,
  artifactStats,
}: {
  artifactName: string;
  artifactStats: readonly (string | undefined)[];
}) {
  return (
    <HoverCard>
      <HoverCardTrigger asChild>
        <div className="flex gap-2 cursor-pointer">
          <img
            src={`/images/heroes/artifacts/${generateSlug(artifactName)}.png`}
            alt={artifactName}
            className="size-16 rounded-md"
          />
          <div className="flex flex-col gap-2 justify-evenly">
            {artifactStats
              .filter((stat) => stat != null)
              .map((stat) => (
                <img
                  key={stat}
                  src={`/images/stats/${generateSlug(stat)}.png`}
                  alt={stat}
                  className="size-6"
                />
              ))}
          </div>
        </div>
      </HoverCardTrigger>
      <HoverCardContent className="space-y-2">
        <div className="font-medium">{artifactName}</div>
        <div className="flex gap-2">
          <img
            src={`/images/heroes/artifacts/${generateSlug(artifactName)}.png`}
            alt={artifactName}
            className="size-16 rounded-md"
          />
          <div className="flex flex-col gap-2">
            {artifactStats
              .filter((stat) => stat != null)
              .map((stat) => (
                <div key={stat} className="capitalize flex gap-1">
                  <img
                    src={`/images/stats/${generateSlug(stat)}.png`}
                    alt={stat}
                    className="w-6 h-6"
                  />
                  {stat}
                </div>
              ))}
          </div>
        </div>
      </HoverCardContent>
    </HoverCard>
  );
}

export default function HeroArtifactsCompact({
  artifacts,
  main_stat,
  className,
}: HeroArtifactsProps) {
  if (artifacts === undefined) return <div className={cn(className)} />;

  return (
    <div className={cn("flex flex-col justify-between", className)}>
      <HeroArtifactMini
        artifactName={artifacts.weapon.name}
        artifactStats={[
          artifacts.weapon.team_buff,
          artifacts.weapon.team_buff_secondary,
        ]}
      />
      <HeroArtifactMini
        artifactName={artifacts.book}
        artifactStats={ArtifactBookStats[artifacts.book]}
      />
      <HeroArtifactMini
        artifactName={`Ring of ${main_stat}`}
        artifactStats={[main_stat]}
      />
    </div>
  );
}
