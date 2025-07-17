// ABOUTME: EquipmentLevels component displays and allows editing of hero equipment tier levels (1-16)
// ABOUTME: Shows plus/minus buttons for updating equipment progression
import { MinusIcon, PlusIcon } from "lucide-react";
import { Button } from "~/components/ui/button";
import { Label } from "~/components/ui/label";
import { cn } from "~/lib/utils";

interface EquipmentLevelsProps {
  level: number;
  maxLevel?: number;
  readOnly?: boolean;
  onLevelChange?: (level: number) => void;
  className?: string;
}

export function EquipmentLevels({ 
  level, 
  maxLevel = 16, 
  readOnly = false, 
  onLevelChange, 
  className 
}: EquipmentLevelsProps) {
  const handleIncrement = () => {
    if (!readOnly && onLevelChange && level < maxLevel) {
      onLevelChange(level + 1);
    }
  };

  const handleDecrement = () => {
    if (!readOnly && onLevelChange && level > 1) {
      onLevelChange(level - 1);
    }
  };

  // Generate tier colors based on level ranges
  const getTierColor = (level: number) => {
    if (level === 1) return "text-gray-600"; // Common
    if (level <= 3) return "text-green-600"; // Uncommon (2-3)
    if (level <= 6) return "text-blue-600"; // Rare (4-6)
    if (level <= 10) return "text-purple-600"; // Epic (7-10)
    if (level <= 15) return "text-orange-600"; // Legendary (11-15)
    return "text-red-600"; // Mythic (16)
  };

  if (readOnly) {
    return (
      <div className={cn("flex items-center gap-2 justify-center", className)}>
        <Label className="text-sm font-medium">Equipment Level:</Label>
        <span className={cn("font-semibold", getTierColor(level))}>
          {level}/{maxLevel}
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">Equipment Level</Label>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleDecrement}
          disabled={readOnly || level <= 1}
          className="size-8 p-0"
        >
          <MinusIcon className="size-4" />
        </Button>
        <span className={cn("font-semibold min-w-[3rem] text-center", getTierColor(level))}>
          {level}/{maxLevel}
        </span>
        <Button
          variant="outline"
          size="sm"
          onClick={handleIncrement}
          disabled={readOnly || level >= maxLevel}
          className="size-8 p-0"
        >
          <PlusIcon className="size-4" />
        </Button>
      </div>
    </div>
  );
}