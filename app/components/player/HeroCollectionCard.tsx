// ABOUTME: HeroCollectionCard component displays individual hero in user's collection
// ABOUTME: Shows hero details with editable star rating and equipment levels
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { StarRating } from "./StarRating";
import { EquipmentLevels } from "./EquipmentLevels";
import { TrashIcon } from "lucide-react";
import { cn } from "~/lib/utils";
import type { PlayerHeroWithDetails } from "~/repositories/types";

interface HeroCollectionCardProps {
  playerHero: PlayerHeroWithDetails;
  onUpdateStars?: (stars: number) => void;
  onUpdateEquipment?: (level: number) => void;
  onRemoveHero?: () => void;
  isUpdating?: boolean;
  className?: string;
}

export function HeroCollectionCard({
  playerHero,
  onUpdateStars,
  onUpdateEquipment,
  onRemoveHero,
  isUpdating = false,
  className
}: HeroCollectionCardProps) {
  const { hero, stars, equipment_level, created_at } = playerHero;

  const getFactionColor = (faction: string) => {
    switch (faction.toLowerCase()) {
      case 'chaos': return 'bg-red-100 text-red-800';
      case 'order': return 'bg-blue-100 text-blue-800';
      case 'nature': return 'bg-green-100 text-green-800';
      case 'progress': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getClassColor = (heroClass: string) => {
    switch (heroClass.toLowerCase()) {
      case 'tank': return 'bg-orange-100 text-orange-800';
      case 'warrior': return 'bg-red-100 text-red-800';
      case 'marksman': return 'bg-green-100 text-green-800';
      case 'mage': return 'bg-blue-100 text-blue-800';
      case 'support': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  return (
    <Card className={cn("transition-all duration-200 hover:shadow-md", className)}>
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <CardTitle className="text-lg">{hero.name}</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemoveHero}
            disabled={isUpdating}
            className="text-red-500 hover:text-red-700 hover:bg-red-50"
          >
            <TrashIcon className="size-4" />
          </Button>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Badge className={getFactionColor(hero.faction)}>
            {hero.faction}
          </Badge>
          <Badge className={getClassColor(hero.class)}>
            {hero.class}
          </Badge>
          <Badge variant="outline">
            {hero.main_stat}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-3">
          <div>
            <label className="text-sm font-medium text-gray-700 mb-1 block">
              Star Rating
            </label>
            <StarRating
              stars={stars}
              onStarClick={onUpdateStars}
              readOnly={isUpdating}
            />
          </div>
          
          <EquipmentLevels
            level={equipment_level}
            onLevelChange={onUpdateEquipment}
            readOnly={isUpdating}
          />
        </div>
        
        <div className="pt-2 border-t text-xs text-gray-500">
          Added: {created_at ? formatDate(created_at) : 'Unknown date'}
        </div>
      </CardContent>
    </Card>
  );
}