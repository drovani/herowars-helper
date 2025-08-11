// ABOUTME: HeroView component provides functional hero management interface
// ABOUTME: Allows editing of hero level, talisman level, stars, and equipment progression
import { useState } from "react";
import { Link } from "react-router";
import { Button } from "~/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";
import type { PlayerHeroWithDetails } from "~/repositories/types";
import { EquipmentLevels } from "../EquipmentLevels";
import { StarRating } from "../StarRating";

interface HeroViewProps {
  playerHero: PlayerHeroWithDetails;
  onUpdate?: (updates: {
    level?: number;
    talisman_level?: number;
    stars?: number;
    equipment_level?: number;
  }) => void;
  isUpdating?: boolean;
}

export function HeroView({ playerHero, onUpdate, isUpdating = false }: HeroViewProps) {
  const { hero, stars, equipment_level, level, talisman_level } = playerHero;
  
  // Local state for form inputs
  const [localLevel, setLocalLevel] = useState(level || 1);
  const [localTalismanLevel, setLocalTalismanLevel] = useState(talisman_level || 0);

  const handleLevelChange = (newLevel: number) => {
    setLocalLevel(newLevel);
    onUpdate?.({ level: newLevel });
  };

  const handleTalismanLevelChange = (newTalismanLevel: number) => {
    setLocalTalismanLevel(newTalismanLevel);
    onUpdate?.({ talisman_level: newTalismanLevel });
  };

  const handleStarsChange = (newStars: number) => {
    onUpdate?.({ stars: newStars });
  };

  const handleEquipmentLevelChange = (newEquipmentLevel: number) => {
    onUpdate?.({ equipment_level: newEquipmentLevel });
  };

  const getFactionColor = (faction: string) => {
    const normalizedFaction = faction.toLowerCase();
    switch (normalizedFaction) {
      case "chaos":
        return "text-red-600 border-red-200 bg-red-50";
      case "nature":
        return "text-green-600 border-green-200 bg-green-50";
      case "progress":
        return "text-purple-600 border-purple-200 bg-purple-50";
      case "honor":
        return "text-blue-600 border-blue-200 bg-blue-50";
      case "eternity":
        return "text-amber-600 border-amber-200 bg-amber-50";
      case "mystery":
        return "text-slate-600 border-slate-200 bg-slate-50";
      default:
        return "text-gray-600 border-gray-200 bg-gray-50";
    }
  };

  return (
    <div className="space-y-6">
      {/* Hero Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-4">
            <div className="relative">
              <img
                src={`/images/heroes/${hero.slug}.png`}
                alt={hero.name}
                className="size-20 rounded-lg object-cover"
              />
            </div>
            <div className="flex-1">
              <CardTitle className="text-2xl">{hero.name}</CardTitle>
              <div className="flex items-center gap-4 mt-2">
                <div
                  className={cn(
                    "px-3 py-1 rounded-full text-sm font-medium border capitalize",
                    getFactionColor(hero.faction)
                  )}
                >
                  {hero.faction}
                </div>
                <div className="flex items-center gap-2">
                  <img
                    src={`/images/classes/${hero.class.toLowerCase()}.png`}
                    alt={hero.class}
                    className="size-6 rounded"
                  />
                  <span className="text-sm text-gray-600 capitalize">
                    {hero.class}
                  </span>
                </div>
              </div>
            </div>
            <Link
              to={`/heroes/${hero.slug}`}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              View Details →
            </Link>
          </div>
        </CardHeader>
      </Card>

      {/* Hero Level Management */}
      <Card>
        <CardHeader>
          <CardTitle>Hero Level</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Hero Level */}
            <div>
              <Label htmlFor="hero-level">Hero Level (1-120)</Label>
              <div className="flex items-center gap-2 mt-1">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    localLevel > 1 && handleLevelChange(localLevel - 1)
                  }
                  disabled={isUpdating || localLevel <= 1}
                  className="size-8 p-0"
                >
                  -
                </Button>
                <Input
                  id="hero-level"
                  type="number"
                  min="1"
                  max="120"
                  value={localLevel}
                  onChange={(e) => {
                    const value = Math.min(120, Math.max(1, parseInt(e.target.value) || 1));
                    handleLevelChange(value);
                  }}
                  className="text-center"
                  disabled={isUpdating}
                />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() =>
                    localLevel < 120 && handleLevelChange(localLevel + 1)
                  }
                  disabled={isUpdating || localLevel >= 120}
                  className="size-8 p-0"
                >
                  +
                </Button>
              </div>
            </div>

            {/* Talisman Level - Only shown if hero is level 120 */}
            {localLevel === 120 && (
              <div>
                <Label htmlFor="talisman-level">Talisman Level (0-50)</Label>
                <div className="flex items-center gap-2 mt-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      localTalismanLevel > 0 &&
                      handleTalismanLevelChange(localTalismanLevel - 1)
                    }
                    disabled={isUpdating || localTalismanLevel <= 0}
                    className="size-8 p-0"
                  >
                    -
                  </Button>
                  <Input
                    id="talisman-level"
                    type="number"
                    min="0"
                    max="50"
                    value={localTalismanLevel}
                    onChange={(e) => {
                      const value = Math.min(50, Math.max(0, parseInt(e.target.value) || 0));
                      handleTalismanLevelChange(value);
                    }}
                    className="text-center"
                    disabled={isUpdating}
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      localTalismanLevel < 50 &&
                      handleTalismanLevelChange(localTalismanLevel + 1)
                    }
                    disabled={isUpdating || localTalismanLevel >= 50}
                    className="size-8 p-0"
                  >
                    +
                  </Button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Only available when hero reaches level 120
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Star Rating */}
      <Card>
        <CardHeader>
          <CardTitle>Star Rating</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-4">
            <StarRating
              stars={stars}
              onStarClick={handleStarsChange}
              readOnly={isUpdating}
            />
          </div>
        </CardContent>
      </Card>

      {/* Equipment Level */}
      <Card>
        <CardHeader>
          <CardTitle>Equipment Tier</CardTitle>
        </CardHeader>
        <CardContent>
          <EquipmentLevels
            level={equipment_level}
            onLevelChange={handleEquipmentLevelChange}
            readOnly={isUpdating}
          />
          <p className="text-sm text-gray-600 mt-4">
            Equipment items for each tier can be found in campaign missions.
            Higher tiers provide better stats and require materials from harder content.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}