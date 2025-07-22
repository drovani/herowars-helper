import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import type { HeroRecord } from "~/data/hero.zod";
import type { MissionRecord } from "~/data/mission.zod";

interface HeroStoneSourcesProps {
  stoneSource: HeroRecord["stone_source"];
  campaignSources: MissionRecord[];
}

export default function HeroStoneSources({
  stoneSource,
  campaignSources,
}: HeroStoneSourcesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Stone Sources</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2 flex-wrap">
          {stoneSource
            .filter((s) => s !== "Campaign")
            .map((source) => (
              <Badge key={source} variant="outline">
                {source}
              </Badge>
            ))}
          {campaignSources.length > 0 &&
            campaignSources.map((mission) => (
              <Link to={`/missions/${mission.id}`} key={mission.id}>
                <Badge variant="outline">
                  {mission.chapter}-{mission.mission_number}: {mission.name}
                </Badge>
              </Link>
            ))}
        </div>
      </CardContent>
    </Card>
  );
}
