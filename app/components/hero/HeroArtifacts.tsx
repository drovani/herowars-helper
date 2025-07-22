import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { HeroRecord } from "~/data/hero.zod";
import { ArtifactBookStats, HeroMainStat } from "~/data/ReadonlyArrays";
import { generateSlug } from "~/lib/utils";

interface HeroArtifactsProps {
  artifacts: HeroRecord["artifacts"];
  main_stat: HeroMainStat;
}

export default function HeroArtifacts({
  artifacts,
  main_stat,
}: HeroArtifactsProps) {
  if (artifacts === undefined) return null;

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {/* Weapon Card */}
      <Card>
        <CardHeader>
          <CardTitle>{artifacts.weapon.name}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-2">
          <div className="size-12 xl:size-16 aspect-square rounded relative overflow-hidden">
            <img
              src={`/images/heroes/artifacts/${generateSlug(
                artifacts.weapon.name
              )}.png`}
              alt={artifacts.weapon.name}
              className="object-contain"
              onError={(e) => {
                e.currentTarget.src = "/images/heroes/border-white.png";
              }}
            />
          </div>
          <div>
            <div className="flex flex-col gap-2">
              <Badge variant="secondary" className="capitalize">
                Activation chance
              </Badge>
              <div
                key={artifacts.weapon.team_buff}
                className="capitalize flex gap-1"
              >
                <img
                  src={`/images/stats/${generateSlug(
                    artifacts.weapon.team_buff
                  )}.png`}
                  alt={artifacts.weapon.team_buff}
                  className="w-6 h-6"
                />
                {artifacts.weapon.team_buff}
              </div>
              {artifacts.weapon.team_buff_secondary && (
                <div
                  key={artifacts.weapon.team_buff_secondary}
                  className="capitalize flex gap-1"
                >
                  <img
                    src={`/images/stats/${generateSlug(
                      artifacts.weapon.team_buff_secondary
                    )}.png`}
                    alt={artifacts.weapon.team_buff_secondary}
                    className="w-6 h-6"
                  />
                  {artifacts.weapon.team_buff_secondary}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Book Card */}
      <Card>
        <CardHeader>
          <CardTitle>{artifacts.book}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-start gap-4">
          <div className="size-12 xl:size-16 aspect-square rounded relative overflow-hidden">
            <img
              src={`/images/heroes/artifacts/${generateSlug(
                artifacts.book
              )}.png`}
              alt={artifacts.book}
              className="object-contain"
            />
          </div>
          <div>
            <div className="flex flex-col gap-2">
              {ArtifactBookStats[artifacts.book].map((stat) => (
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
        </CardContent>
      </Card>

      {/* Ring Card */}
      <Card>
        <CardHeader>
          <CardTitle>Ring of {main_stat}</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center gap-4">
          <div className="size-12 xl:size-16 aspect-square rounded relative overflow-hidden">
            <img
              src={`/images/heroes/artifacts/ring-of-${main_stat}.png`}
              alt={`Ring of ${main_stat}`}
              className="object-contain"
            />
          </div>
          <div>
            <div className="capitalize flex gap-2">
              <img
                src={`/images/stats/${generateSlug(main_stat)}.png`}
                alt={main_stat}
                className="w-6 h-6"
              />
              {main_stat}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
