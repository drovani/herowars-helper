// ABOUTME: HeroListItem component displays individual hero in sidebar hero list
// ABOUTME: Shows hero portrait with equipment border, level display, and star rating for list navigation
import { cn } from "~/lib/utils";
import type { PlayerHeroWithDetails } from "~/repositories/types";

interface HeroListItemProps {
  playerHero: PlayerHeroWithDetails;
  isSelected?: boolean;
  onClick?: () => void;
  className?: string;
}

export function HeroListItem({
  playerHero,
  isSelected = false,
  onClick,
  className,
}: HeroListItemProps) {
  const { hero, stars, equipment_level, level, talisman_level } = playerHero;

  // Level display priority: Talisman level if hero is max level and has talisman
  const displayLevel =
    level === 120 && (talisman_level || 0) > 0 ? `T${talisman_level || 0}` : `L${level || 1}`;

  // Equipment tier border color based on equipment level
  const getEquipmentBorderColor = (equipmentLevel: number) => {
    if (equipmentLevel === 1) return "border-gray-400"; // Common
    if (equipmentLevel <= 3) return "border-green-500"; // Uncommon (2-3)
    if (equipmentLevel <= 6) return "border-blue-500"; // Rare (4-6)
    if (equipmentLevel <= 10) return "border-purple-500"; // Epic (7-10)
    if (equipmentLevel <= 15) return "border-orange-500"; // Legendary (11-15)
    return "border-red-500"; // Mythic (16)
  };

  // Faction color for the name badge
  const getFactionColor = (faction: string) => {
    const normalizedFaction = faction.toLowerCase();
    switch (normalizedFaction) {
      case "chaos":
        return "text-red-600";
      case "nature":
        return "text-green-600";
      case "progress":
        return "text-purple-600";
      case "honor":
        return "text-blue-600";
      case "eternity":
        return "text-amber-600";
      case "mystery":
        return "text-slate-600";
      default:
        return "text-gray-600";
    }
  };

  return (
    <button
      onClick={onClick}
      className={cn(
        "w-full p-3 text-left transition-all duration-200 hover:bg-gray-50 border-l-4 border-transparent",
        isSelected && "bg-blue-50 border-l-blue-500",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {/* Hero Portrait with Equipment Border */}
        <div className="relative flex-shrink-0">
          <div
            className={cn(
              "size-12 rounded border-2 overflow-hidden",
              getEquipmentBorderColor(equipment_level)
            )}
          >
            <img
              src={`/images/heroes/${hero.slug}.png`}
              alt={hero.name}
              className="size-full object-cover"
            />
          </div>
          {/* Level Badge */}
          <div className="absolute -bottom-1 -right-1 bg-gray-800 text-white text-xs px-1 py-0.5 rounded text-center min-w-[20px]">
            {displayLevel}
          </div>
        </div>

        {/* Hero Info */}
        <div className="flex-1 min-w-0">
          <h3
            className={cn(
              "font-medium text-sm truncate",
              getFactionColor(hero.faction)
            )}
          >
            {hero.name}
          </h3>

          {/* Star Rating */}
          <div className="flex items-center gap-1 mt-1">
            {Array.from({ length: 6 }, (_, index) => (
              <div
                key={index}
                className={cn(
                  "size-2 rounded-full",
                  index < stars ? "bg-yellow-400" : "bg-gray-200"
                )}
              />
            ))}
          </div>

          {/* Class Badge */}
          <div className="flex items-center gap-1 mt-1">
            <img
              src={`/images/classes/${hero.class.toLowerCase()}.png`}
              alt={hero.class}
              className="size-3 rounded"
            />
            <span className="text-xs text-gray-500 capitalize">
              {hero.class}
            </span>
          </div>
        </div>
      </div>
    </button>
  );
}