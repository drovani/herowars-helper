// ABOUTME: Hero detail route handles individual hero management with view switching
// ABOUTME: Defaults to hero view and supports URL-based view navigation
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

export default function HeroDetail() {
  const params = useParams();
  const { selectedHero, onHeroUpdate, isUpdating, activeView } =
    useOutletContext<OutletContext>();

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
          <CardContent>
            <p className="text-sm text-gray-600">
              This could mean:
            </p>
            <ul className="list-disc ml-6 mt-2 text-sm text-gray-600">
              <li>The hero is not in your collection</li>
              <li>There was an error loading your collection</li>
              <li>The hero slug in the URL is incorrect</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <HeroDetailView
      playerHero={selectedHero}
      activeView={activeView}
      onUpdate={onHeroUpdate}
      isUpdating={isUpdating}
    />
  );
}