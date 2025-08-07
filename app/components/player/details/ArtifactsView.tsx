// ABOUTME: ArtifactsView component provides placeholder for hero artifacts management interface  
// ABOUTME: Will be implemented to handle three artifacts with star and level management
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { PlayerHeroWithDetails } from "~/repositories/types";

interface ArtifactsViewProps {
  playerHero: PlayerHeroWithDetails;
}

export function ArtifactsView({ playerHero }: ArtifactsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Artifacts</CardTitle>
        <CardDescription>
          Artifact management for {playerHero.hero.name} coming soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This feature is under development. Future functionality will include:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
          <li>Weapon artifact with team buff activation tracking</li>
          <li>Book artifact with fixed stat pair management</li>
          <li>Ring artifact that always boosts the hero's main stat</li>
          <li>Star level progression (1-6 stars) for each artifact</li>
          <li>Upgrade level tracking and resource calculations</li>
          <li>Artifact stone source and farming recommendations</li>
        </ul>
        <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-800">
            <strong>Artifact Types:</strong> Each hero has exactly three artifacts:
            Weapon (team buff), Book (stat pair), and Ring (main stat boost).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}