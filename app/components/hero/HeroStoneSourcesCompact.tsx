import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import type { HeroRecord } from "~/data/hero.zod";
import type { Mission } from "~/services/MissionRepository";

interface HeroStoneSourcesProps {
  stoneSources: HeroRecord["stone_source"];
  campaignSources: Mission[];
}

export default function HeroStoneSources({ stoneSources, campaignSources }: HeroStoneSourcesProps) {
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
          <Link to={`/missions/${mission.slug}`} key={mission.slug}>
            <Badge variant="outline">
              {mission.chapter_id}-{mission.level}: {mission.name}
            </Badge>
          </Link>
        ))}
    </div>
  );
}
