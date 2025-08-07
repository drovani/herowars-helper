// ABOUTME: Roster index route displays empty state when no hero is selected
// ABOUTME: Provides instructions and links for selecting heroes from the sidebar
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";

export default function RosterIndex() {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Select a Hero</CardTitle>
            <CardDescription>
              Choose a hero from the sidebar to view and manage their details
            </CardDescription>
          </CardHeader>
          <CardContent className="text-center space-y-4">
            <div className="text-6xl">⚔️</div>
            <div className="space-y-2 text-sm text-gray-600">
              <p>
                <strong>Desktop:</strong> Use the sidebar to browse and select heroes
              </p>
              <p>
                <strong>Mobile:</strong> Scroll through hero portraits at the top
              </p>
            </div>
            <div className="text-xs text-gray-500 space-y-1">
              <p>Available views for each hero:</p>
              <p>• Hero: Level, stars, and equipment</p>
              <p>• Skills: Skill management (coming soon)</p>
              <p>• Skins: Cosmetic upgrades (coming soon)</p>
              <p>• Artifacts: Weapon, book, ring (coming soon)</p>
              <p>• Glyphs: Stat enhancements (coming soon)</p>
              <p>• Sparks: Gift of Elements (coming soon)</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}