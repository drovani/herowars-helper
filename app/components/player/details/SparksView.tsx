// ABOUTME: SparksView component provides placeholder for hero sparks (Gift of Elements) management interface
// ABOUTME: Will be implemented to handle Gift of Elements rank management and stat bonuses
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { PlayerHeroWithDetails } from "~/repositories/types";

interface SparksViewProps {
  playerHero: PlayerHeroWithDetails;
}

export function SparksView({ playerHero }: SparksViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Sparks (Gift of Elements)</CardTitle>
        <CardDescription>
          Gift of Elements rank management for {playerHero.hero.name} coming soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This feature is under development. Future functionality will include:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
          <li>Gift of Elements rank progression tracking</li>
          <li>Spark stone collection and upgrade costs</li>
          <li>Stat bonus calculations for each rank</li>
          <li>Element type compatibility and effects</li>
          <li>Resource farming recommendations</li>
          <li>Gift of Elements event scheduling</li>
        </ul>
        <div className="mt-6 p-4 bg-red-50 rounded-lg border border-red-200">
          <p className="text-sm text-red-800">
            <strong>Sparks System:</strong> Gift of Elements provides significant
            stat bonuses and is one of the most impactful late-game progression
            systems for hero development.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}