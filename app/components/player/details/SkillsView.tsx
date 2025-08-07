// ABOUTME: SkillsView component provides placeholder for hero skills management interface
// ABOUTME: Will be implemented to handle skill level management and descriptions
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { PlayerHeroWithDetails } from "~/repositories/types";

interface SkillsViewProps {
  playerHero: PlayerHeroWithDetails;
}

export function SkillsView({ playerHero }: SkillsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skills</CardTitle>
        <CardDescription>
          Skill management for {playerHero.hero.name} coming soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This feature is under development. Future functionality will include:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
          <li>Skill level management (1-130 for each skill)</li>
          <li>Skill descriptions and effects at different levels</li>
          <li>Resource requirement calculations</li>
          <li>Skill priority recommendations</li>
          <li>Integration with hero progression tracking</li>
        </ul>
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-800">
            <strong>Coming Next:</strong> This will be one of the first detail
            views to be fully implemented after the UI scaffolding is complete.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}