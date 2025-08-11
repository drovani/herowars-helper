// ABOUTME: SkinsView component provides placeholder for hero skins management interface
// ABOUTME: Will be implemented to handle skin claiming and level management
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { PlayerHeroWithDetails } from "~/repositories/types";

interface SkinsViewProps {
  playerHero: PlayerHeroWithDetails;
}

export function SkinsView({ playerHero }: SkinsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Skins</CardTitle>
        <CardDescription>
          Skin management for {playerHero.hero.name} coming soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This feature is under development. Future functionality will include:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
          <li>Skin claiming and upgrade level tracking</li>
          <li>Cosmetic skin selection and preview</li>
          <li>Stat bonuses from skin upgrades</li>
          <li>Skin stone source tracking</li>
          <li>Event skin availability calendar</li>
        </ul>
        <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <p className="text-sm text-green-800">
            <strong>Note:</strong> Skins provide permanent stat bonuses regardless
            of which cosmetic skin is currently equipped.
          </p>
        </div>
      </CardContent>
    </Card>
  );
}