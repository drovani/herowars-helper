// ABOUTME: Team hero display component showing heroes in rank order
// ABOUTME: Displays heroes left-to-right in descending order_rank with remove functionality

import { XIcon } from "lucide-react";
import { Badge } from "~/components/ui/badge";
import { Button } from "~/components/ui/button";
import { Card, CardContent } from "~/components/ui/card";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "~/components/ui/tooltip";
import type { PlayerTeamHero, Hero } from "~/repositories/types";

interface TeamHeroSlotProps {
  teamHero?: PlayerTeamHero & { hero: Hero };
  position: number;
  onRemove?: (heroSlug: string) => void;
  isRemoving?: boolean;
  readonly?: boolean;
}

function TeamHeroSlot({
  teamHero,
  position,
  onRemove,
  isRemoving = false,
  readonly = false,
}: TeamHeroSlotProps) {
  const handleRemove = () => {
    if (teamHero && onRemove) {
      onRemove(teamHero.hero_slug);
    }
  };

  if (!teamHero) {
    return (
      <Card className="w-20 h-24 border-2 border-dashed border-muted-foreground/25">
        <CardContent className="flex items-center justify-center h-full p-2">
          <div className="text-center">
            <div className="text-xs text-muted-foreground font-medium">
              Slot {position}
            </div>
            <div className="text-xs text-muted-foreground/60 mt-1">Empty</div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Card className="w-20 h-24 relative group hover:shadow-md transition-shadow">
            <CardContent className="p-2 h-full flex flex-col">
              {/* Remove button */}
              {!readonly && onRemove && (
                <Button
                  variant="destructive"
                  size="sm"
                  className="absolute -top-2 -right-2 h-5 w-5 p-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={handleRemove}
                  disabled={isRemoving}
                >
                  <XIcon className="h-3 w-3" />
                  <span className="sr-only">Remove {teamHero.hero.name}</span>
                </Button>
              )}

              {/* Hero info */}
              <div className="flex-1 flex flex-col justify-between text-center">
                <div>
                  <div
                    className="text-xs font-medium truncate"
                    title={teamHero.hero.name}
                  >
                    {teamHero.hero.name}
                  </div>
                  <Badge variant="outline" className="text-xs mt-1 px-1">
                    #{teamHero.hero.order_rank}
                  </Badge>
                </div>

                <div className="mt-1">
                  <div className="text-xs text-muted-foreground capitalize">
                    {teamHero.hero.class}
                  </div>
                  <div className="text-xs text-muted-foreground capitalize">
                    {teamHero.hero.faction}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TooltipTrigger>
        <TooltipContent>
          <div className="text-center">
            <div className="font-medium">{teamHero.hero.name}</div>
            <div className="text-sm text-muted-foreground">
              Order Rank: {teamHero.hero.order_rank}
            </div>
            <div className="text-sm text-muted-foreground">
              {teamHero.hero.class} • {teamHero.hero.faction}
            </div>
            <div className="text-sm text-muted-foreground">
              Main Stat: {teamHero.hero.main_stat}
            </div>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

interface TeamHeroDisplayProps {
  teamHeroes: Array<PlayerTeamHero & { hero: Hero }>;
  onRemoveHero?: (heroSlug: string) => void;
  removingHeroSlug?: string;
  readonly?: boolean;
  className?: string;
}

export function TeamHeroDisplay({
  teamHeroes,
  onRemoveHero,
  removingHeroSlug,
  readonly = false,
  className,
}: TeamHeroDisplayProps) {
  // Sort heroes by order_rank descending (highest rank first, left-to-right)
  const sortedHeroes = [...teamHeroes].sort(
    (a, b) => b.hero.order_rank - a.hero.order_rank
  );

  // Create array of 5 slots, filling with heroes or undefined
  const slots = Array.from({ length: 5 }, (_, index) => sortedHeroes[index]);

  return (
    <div className={`flex gap-3 ${className || ""}`}>
      {slots.map((teamHero, index) => (
        <TeamHeroSlot
          key={teamHero?.id || `slot-${index}`}
          teamHero={teamHero}
          position={index + 1}
          onRemove={onRemoveHero}
          isRemoving={removingHeroSlug === teamHero?.hero_slug}
          readonly={readonly}
        />
      ))}
    </div>
  );
}

export { TeamHeroSlot };
