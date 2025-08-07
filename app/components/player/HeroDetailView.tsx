// ABOUTME: HeroDetailView component manages view switching and layout for hero detail screens
// ABOUTME: Routes between different hero management views and handles common data fetching
import { cn } from "~/lib/utils";
import type { PlayerHeroWithDetails } from "~/repositories/types";
import { ArtifactsView } from "./details/ArtifactsView";
import { GlyphsView } from "./details/GlyphsView";
import { HeroView } from "./details/HeroView";
import { SkillsView } from "./details/SkillsView";
import { SkinsView } from "./details/SkinsView";
import { SparksView } from "./details/SparksView";

interface HeroDetailViewProps {
  playerHero: PlayerHeroWithDetails;
  activeView: string;
  onUpdate?: (updates: {
    level?: number;
    talisman_level?: number;
    stars?: number;
    equipment_level?: number;
  }) => void;
  isUpdating?: boolean;
  className?: string;
}

export function HeroDetailView({
  playerHero,
  activeView,
  onUpdate,
  isUpdating = false,
  className,
}: HeroDetailViewProps) {
  const renderView = () => {
    switch (activeView) {
      case "hero":
        return (
          <HeroView
            playerHero={playerHero}
            onUpdate={onUpdate}
            isUpdating={isUpdating}
          />
        );
      case "skills":
        return <SkillsView playerHero={playerHero} />;
      case "skins":
        return <SkinsView playerHero={playerHero} />;
      case "artifacts":
        return <ArtifactsView playerHero={playerHero} />;
      case "glyphs":
        return <GlyphsView playerHero={playerHero} />;
      case "sparks":
        return <SparksView playerHero={playerHero} />;
      default:
        return (
          <HeroView
            playerHero={playerHero}
            onUpdate={onUpdate}
            isUpdating={isUpdating}
          />
        );
    }
  };

  return (
    <div className={cn("flex-1 overflow-y-auto p-6", className)}>
      {renderView()}
    </div>
  );
}