// ABOUTME: HeroListSidebar component displays scrollable list of heroes for navigation
// ABOUTME: Includes search, filtering, and sorting controls for managing hero collection view
import { SearchIcon } from "lucide-react";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "~/components/ui/select";
import { cn } from "~/lib/utils";
import type { PlayerHeroWithDetails } from "~/repositories/types";
import { HeroListItem } from "./HeroListItem";

interface HeroListSidebarProps {
  heroes: PlayerHeroWithDetails[];
  selectedHeroSlug: string | null;
  onSelectHero: (slug: string) => void;
  sortBy: string;
  onSortChange: (sort: string) => void;
  searchTerm: string;
  onSearchChange: (term: string) => void;
  classFilter: string;
  onClassFilterChange: (cls: string) => void;
  factionFilter: string;
  onFactionFilterChange: (faction: string) => void;
  className?: string;
}

export function HeroListSidebar({
  heroes,
  selectedHeroSlug,
  onSelectHero,
  sortBy,
  onSortChange,
  searchTerm,
  onSearchChange,
  classFilter,
  onClassFilterChange,
  factionFilter,
  onFactionFilterChange,
  className,
}: HeroListSidebarProps) {
  // Filter heroes based on search and filters
  const filteredHeroes = heroes.filter((item) => {
    const matchesSearch = item.hero.name
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    const matchesClass =
      classFilter === "all" || item.hero.class === classFilter;
    const matchesFaction =
      factionFilter === "all" || item.hero.faction === factionFilter;

    return matchesSearch && matchesClass && matchesFaction;
  });

  // Sort heroes
  const sortedHeroes = [...filteredHeroes].sort((a, b) => {
    switch (sortBy) {
      case "name":
        return a.hero.name.localeCompare(b.hero.name);
      case "order_rank":
        return (a.hero.order_rank || 999) - (b.hero.order_rank || 999);
      case "stars":
        return b.stars !== a.stars
          ? b.stars - a.stars
          : a.hero.name.localeCompare(b.hero.name);
      case "equipment":
        return b.equipment_level !== a.equipment_level
          ? b.equipment_level - a.equipment_level
          : a.hero.name.localeCompare(b.hero.name);
      default:
        return 0;
    }
  });

  // Get unique classes and factions for filter options
  const uniqueClasses = [
    ...new Set(heroes.map((h) => h.hero.class)),
  ].sort();
  const uniqueFactions = [
    ...new Set(heroes.map((h) => h.hero.faction)),
  ].sort();

  return (
    <div className={cn("flex flex-col h-full bg-white border-r", className)}>
      {/* Header */}
      <div className="p-4 border-b">
        <h2 className="text-lg font-semibold text-gray-900">
          Heroes ({sortedHeroes.length})
        </h2>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-4 border-b">
        {/* Search */}
        <div className="relative">
          <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 size-4" />
          <Input
            placeholder="Search heroes..."
            value={searchTerm}
            onChange={(e) => onSearchChange(e.target.value)}
            className="pl-10"
          />
        </div>

        {/* Sort */}
        <div>
          <Label htmlFor="sort-by" className="text-sm font-medium">
            Sort By
          </Label>
          <Select value={sortBy} onValueChange={onSortChange}>
            <SelectTrigger id="sort-by" className="mt-1">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="name">Name</SelectItem>
              <SelectItem value="order_rank">Order Rank</SelectItem>
              <SelectItem value="stars">Stars (High to Low)</SelectItem>
              <SelectItem value="equipment">Equipment (High to Low)</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Filters Row */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label htmlFor="class-filter" className="text-sm font-medium">
              Class
            </Label>
            <Select value={classFilter} onValueChange={onClassFilterChange}>
              <SelectTrigger id="class-filter" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueClasses.map((cls) => (
                  <SelectItem key={cls} value={cls} className="capitalize">
                    {cls}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="faction-filter" className="text-sm font-medium">
              Faction
            </Label>
            <Select value={factionFilter} onValueChange={onFactionFilterChange}>
              <SelectTrigger id="faction-filter" className="mt-1">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                {uniqueFactions.map((faction) => (
                  <SelectItem
                    key={faction}
                    value={faction}
                    className="capitalize"
                  >
                    {faction}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

      {/* Hero List */}
      <div className="flex-1 overflow-y-auto">
        {sortedHeroes.length > 0 ? (
          <div className="space-y-0">
            {sortedHeroes.map((playerHero) => (
              <HeroListItem
                key={playerHero.id}
                playerHero={playerHero}
                isSelected={playerHero.hero_slug === selectedHeroSlug}
                onClick={() => onSelectHero(playerHero.hero_slug)}
              />
            ))}
          </div>
        ) : (
          <div className="p-4 text-center text-gray-500">
            <p className="text-sm">
              {heroes.length === 0
                ? "No heroes in collection"
                : "No heroes match your filters"}
            </p>
            {heroes.length === 0 && (
              <p className="text-xs mt-1">
                Add heroes from the Heroes page to get started.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}