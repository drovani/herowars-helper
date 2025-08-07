// ABOUTME: Hero view-specific route handles deep linking to specific hero detail views
// ABOUTME: Supports URLs like /player/roster/aurora/skills for direct navigation
import { useParams, useOutletContext } from "react-router";
import { HeroDetailView } from "~/components/player/HeroDetailView";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { PlayerHeroWithDetails } from "~/repositories/types";

interface OutletContext {
  selectedHero: PlayerHeroWithDetails | null;
  onHeroUpdate: (updates: {
    level?: number;
    talisman_level?: number;
    stars?: number;
    equipment_level?: number;
  }) => void;
  isUpdating: boolean;
  activeView: string;
}

const validViews = ["hero", "skills", "skins", "artifacts", "glyphs", "sparks"];

export default function HeroViewDetail() {
  const params = useParams();
  const { selectedHero, onHeroUpdate, isUpdating } =
    useOutletContext<OutletContext>();

  const view = params.view || "hero";

  if (!validViews.includes(view)) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card>
          <CardHeader>
            <CardTitle>Invalid View</CardTitle>
            <CardDescription>
              The view "{view}" is not a valid hero detail view.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-2">Valid views are:</p>
            <ul className="list-disc ml-6 text-sm text-gray-600">
              {validViews.map((validView) => (
                <li key={validView} className="capitalize">
                  {validView}
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!selectedHero) {
    return (
      <div className="flex-1 flex items-center justify-center p-6">
        <Card>
          <CardHeader>
            <CardTitle>Hero Not Found</CardTitle>
            <CardDescription>
              The hero "{params.heroSlug}" was not found in your collection.
            </CardDescription>
          </CardHeader>
        </Card>
      </div>
    );
  }

  return (
    <HeroDetailView
      playerHero={selectedHero}
      activeView={view}
      onUpdate={onHeroUpdate}
      isUpdating={isUpdating}
    />
  );
}