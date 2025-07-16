// ABOUTME: EquipmentLevels component displays and allows editing of hero equipment tier levels (1-16)
// ABOUTME: Shows a select dropdown or slider for updating equipment progression
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "~/components/ui/select";
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
  const handleLevelChange = (value: string) => {
    if (!readOnly && onLevelChange) {
      onLevelChange(parseInt(value, 10));
    }
  };

  // Generate tier colors based on level ranges
  const getTierColor = (level: number) => {
    if (level <= 3) return "text-gray-600"; // Common
    if (level <= 6) return "text-green-600"; // Uncommon
    if (level <= 9) return "text-blue-600"; // Rare
    if (level <= 12) return "text-purple-600"; // Epic
    if (level <= 15) return "text-orange-600"; // Legendary
    return "text-red-600"; // Mythic
  };

  const getTierName = (level: number) => {
    if (level <= 3) return "Common";
    if (level <= 6) return "Uncommon";
    if (level <= 9) return "Rare";
    if (level <= 12) return "Epic";
    if (level <= 15) return "Legendary";
    return "Mythic";
  };

  if (readOnly) {
    return (
      <div className={cn("flex items-center gap-2", className)}>
        <Label className="text-sm font-medium">Equipment Level:</Label>
        <span className={cn("font-semibold", getTierColor(level))}>
          {level}/{maxLevel}
        </span>
        <span className={cn("text-xs", getTierColor(level))}>
          ({getTierName(level)})
        </span>
      </div>
    );
  }

  return (
    <div className={cn("space-y-2", className)}>
      <Label className="text-sm font-medium">Equipment Level</Label>
      <div className="flex items-center gap-2">
        <Select value={level.toString()} onValueChange={handleLevelChange}>
          <SelectTrigger className="w-20">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {Array.from({ length: maxLevel }, (_, index) => {
              const levelValue = index + 1;
              return (
                <SelectItem key={levelValue} value={levelValue.toString()}>
                  {levelValue}
                </SelectItem>
              );
            })}
          </SelectContent>
        </Select>
        <span className="text-sm text-gray-600">/ {maxLevel}</span>
        <span className={cn("text-xs font-medium", getTierColor(level))}>
          ({getTierName(level)})
        </span>
      </div>
    </div>
  );
}