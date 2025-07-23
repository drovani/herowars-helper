import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import type { HeroRecord } from "~/data/hero.zod";
import type { MissionRecord } from "~/data/mission.zod";

interface HeroStoneSourcesProps {
  stoneSources: HeroRecord["stone_source"];
  campaignSources: MissionRecord[];
}

export default function HeroStoneSources({
  stoneSources,
  campaignSources,
}: HeroStoneSourcesProps) {
  if (!stoneSources) return <div />;

  return (
    <div className="flex gap-2 flex-wrap">
      {stoneSources
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
  );
}
