// ABOUTME: GlyphsView component provides placeholder for hero glyphs management interface
// ABOUTME: Will be implemented to handle glyph levels with gating rules and stat enhancements
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import type { PlayerHeroWithDetails } from "~/repositories/types";

interface GlyphsViewProps {
  playerHero: PlayerHeroWithDetails;
}

export function GlyphsView({ playerHero }: GlyphsViewProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Glyphs</CardTitle>
        <CardDescription>
          Glyph management for {playerHero.hero.name} coming soon
        </CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-muted-foreground mb-4">
          This feature is under development. Future functionality will include:
        </p>
        <ul className="list-disc ml-6 space-y-2 text-sm text-muted-foreground">
          <li>Four secondary stat glyphs plus main stat glyph</li>
          <li>Glyph level progression with gating rules</li>
          <li>Stat enhancement calculations and previews</li>
          <li>Glyph upgrade cost and resource tracking</li>
          <li>Optimal glyph priority recommendations</li>
          <li>Integration with overall hero power calculations</li>
        </ul>
        <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
          <p className="text-sm text-amber-800">
            <strong>Glyph System:</strong> Each hero has five glyphs total - four
            for secondary stats and one that always enhances their main stat
            (Strength, Agility, or Intelligence).
          </p>
        </div>
      </CardContent>
    </Card>
  );
}