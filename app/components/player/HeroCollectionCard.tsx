// ABOUTME: HeroCollectionCard component displays individual hero in user's collection
// ABOUTME: Shows hero details with editable star rating and equipment levels
import { UserRoundMinusIcon } from "lucide-react";
import { useEffect, useState } from "react";
import { Link } from "react-router";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import type { PlayerHeroWithDetails } from "~/repositories/types";
import { EquipmentLevels } from "./EquipmentLevels";
import { StarRating } from "./StarRating";

interface HeroCollectionCardProps {
  playerHero: PlayerHeroWithDetails;
  onUpdateStars?: (stars: number) => void;
  onUpdateEquipment?: (level: number) => void;
  onRemoveHero?: () => void;
  isUpdating?: boolean;
  isRemoving?: boolean;
  className?: string;
}

export function HeroCollectionCard({
  playerHero,
  onUpdateStars,
  onUpdateEquipment,
  onRemoveHero,
  isUpdating = false,
  isRemoving = false,
  className
}: HeroCollectionCardProps) {
  const { hero, stars, equipment_level, created_at } = playerHero;

  // Optimistic state for equipment level
  const [optimisticEquipmentLevel, setOptimisticEquipmentLevel] = useState(equipment_level);
  const [optimisticStars, setOptimisticStars] = useState(stars);

  // Reset optimistic state when server data changes
  useEffect(() => {
    setOptimisticEquipmentLevel(equipment_level);
  }, [equipment_level]);

  useEffect(() => {
    setOptimisticStars(stars);
  }, [stars]);

  const getFactionColor = (faction: string) => {
    const normalizedFaction = faction.toLowerCase();

    switch (normalizedFaction) {
      case 'chaos': return 'bg-red-100 text-red-800';
      case 'nature': return 'bg-green-100 text-green-800';
      case 'progress': return 'bg-purple-100 text-purple-800';
      case 'honor': return 'bg-blue-100 text-blue-800';
      case 'eternity': return 'bg-amber-100 text-amber-800';
      case 'mystery': return 'bg-slate-100 text-slate-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };


  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const handleStarUpdate = (newStars: number) => {
    setOptimisticStars(newStars);
    onUpdateStars?.(newStars);
  };

  const handleEquipmentUpdate = (newLevel: number) => {
    setOptimisticEquipmentLevel(newLevel);
    onUpdateEquipment?.(newLevel);
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardContent className="p-4">
        <div className="flex items-start justify-between mb-4">
          {/* Hero Image and Name */}
          <div className="flex-shrink-0">
            <Link to={`/heroes/${hero.slug}`} viewTransition>
              <img
                src={`/images/heroes/${hero.slug}.png`}
                alt={hero.name}
                className="size-20 rounded-lg object-cover hover:opacity-80 transition-opacity mb-2"
              />
            </Link>
            <Link to={`/heroes/${hero.slug}`} viewTransition>
              <h3 className="font-semibold text-sm leading-tight hover:text-blue-600 transition-colors text-center">
                {hero.name}
              </h3>
            </Link>
          </div>

          {/* Remove Button */}
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveHero}
            disabled={isRemoving || isUpdating}
            className="text-red-500 hover:text-red-700 hover:bg-red-50 flex-shrink-0"
            title="Remove Hero from Collection"
          >
            <UserRoundMinusIcon className="size-4" />
          </Button>
        </div>

        {/* Faction badge and Class image */}
        <div className="flex gap-2 mb-3 justify-center items-center">
          <Badge className={`${getFactionColor(hero.faction)} capitalize`} variant="secondary">
            {hero.faction}
          </Badge>
          <img
            src={`/images/classes/${hero.class.toLowerCase()}.png`}
            alt={hero.class}
            className="size-6 rounded"
            title={hero.class}
          />
        </div>

        {/* Star Rating */}
        <div className="mb-3 flex justify-center">
          <StarRating
            stars={optimisticStars}
            onStarClick={handleStarUpdate}
            readOnly={isUpdating}
          />
        </div>

        {/* Equipment Levels */}
        <EquipmentLevels
          level={optimisticEquipmentLevel}
          onLevelChange={handleEquipmentUpdate}
          readOnly={false}
        />

        {/* Date Added */}
        <div className="mt-3 text-xs text-gray-500 text-center">
          Added: {created_at ? formatDate(created_at) : 'Unknown date'}
        </div>
      </CardContent>
    </Card>
  );
}