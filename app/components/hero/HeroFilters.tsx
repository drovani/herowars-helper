// ABOUTME: Hero filtering component with mobile and desktop responsive UI
// ABOUTME: Provides multi-select filters for class, faction, stats, artifacts, and collection status

import { ChevronDownIcon, FilterIcon, XIcon } from "lucide-react";
import { useState } from "react";
import {
  HeroClass,
  HeroFaction,
  HeroMainStat,
  AttackType,
  StoneSource,
  WeaponTeamBuff,
  ArtifactBookOptions,
  Stats,
} from "~/data/ReadonlyArrays";
import type { HeroFilters as HeroFiltersType } from "~/lib/hero-filtering";
import { Button } from "~/components/ui/button";
import { Checkbox } from "~/components/ui/checkbox";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "~/components/ui/collapsible";
import { Label } from "~/components/ui/label";
import { Popover, PopoverContent, PopoverTrigger } from "~/components/ui/popover";
import { ScrollArea } from "~/components/ui/scroll-area";
import { Separator } from "~/components/ui/separator";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "~/components/ui/sheet";
import { useIsMobile } from "~/hooks/useIsMobile";
import { countActiveFilters } from "~/lib/hero-filtering";

interface HeroFiltersProps {
  filters: HeroFiltersType;
  onFiltersChange: (filters: HeroFiltersType) => void;
  showCollectionFilter?: boolean;
}

export function HeroFilters({
  filters,
  onFiltersChange,
  showCollectionFilter = false,
}: HeroFiltersProps) {
  const isMobile = useIsMobile();
  const activeFilterCount = countActiveFilters(filters);

  if (isMobile) {
    return <MobileFilters filters={filters} onFiltersChange={onFiltersChange} showCollectionFilter={showCollectionFilter} activeFilterCount={activeFilterCount} />;
  }

  return <DesktopFilters filters={filters} onFiltersChange={onFiltersChange} showCollectionFilter={showCollectionFilter} activeFilterCount={activeFilterCount} />;
}

function MobileFilters({
  filters,
  onFiltersChange,
  showCollectionFilter,
  activeFilterCount,
}: HeroFiltersProps & { activeFilterCount: number }) {
  const [open, setOpen] = useState(false);

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button variant="outline" size="sm">
          <FilterIcon className="size-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </SheetTrigger>
      <SheetContent side="left" className="w-full sm:w-96">
        <SheetHeader>
          <SheetTitle>Filter Heroes</SheetTitle>
        </SheetHeader>
        <ScrollArea className="h-[calc(100vh-8rem)] mt-4">
          <FilterContent
            filters={filters}
            onFiltersChange={onFiltersChange}
            showCollectionFilter={showCollectionFilter}
            onClose={() => setOpen(false)}
          />
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

function DesktopFilters({
  filters,
  onFiltersChange,
  showCollectionFilter,
  activeFilterCount,
}: HeroFiltersProps & { activeFilterCount: number }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" size="sm">
          <FilterIcon className="size-4 mr-2" />
          Filters
          {activeFilterCount > 0 && (
            <span className="ml-2 px-1.5 py-0.5 text-xs bg-primary text-primary-foreground rounded-full">
              {activeFilterCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96" align="start">
        <ScrollArea className="h-[500px]">
          <FilterContent
            filters={filters}
            onFiltersChange={onFiltersChange}
            showCollectionFilter={showCollectionFilter}
          />
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
}

function FilterContent({
  filters,
  onFiltersChange,
  showCollectionFilter,
  onClose,
}: HeroFiltersProps & { onClose?: () => void }) {
  const handleFilterChange = <K extends keyof HeroFiltersType>(
    key: K,
    value: string | boolean,
    checked: boolean
  ) => {
    const newFilters = { ...filters };

    if (typeof value === "boolean") {
      if (checked) {
        (newFilters as any)[key] = value;
      } else {
        delete (newFilters as any)[key];
      }
    } else {
      const currentValues = (newFilters[key] as string[]) || [];
      if (checked) {
        (newFilters as any)[key] = [...currentValues, value];
      } else {
        (newFilters as any)[key] = currentValues.filter((v) => v !== value);
        if ((newFilters[key] as string[]).length === 0) {
          delete newFilters[key];
        }
      }
    }

    onFiltersChange(newFilters);
  };

  const handleClearAll = () => {
    onFiltersChange({});
    onClose?.();
  };

  return (
    <div className="space-y-4 p-1">
      <div className="flex justify-between items-center">
        <h3 className="font-semibold text-sm">Filters</h3>
        <Button variant="ghost" size="sm" onClick={handleClearAll}>
          Clear All
        </Button>
      </div>

      <Separator />

      {/* Collection Filter */}
      {showCollectionFilter && (
        <>
          <FilterSection title="Collection">
            <FilterCheckbox
              label="In Collection"
              checked={filters.in_collection || false}
              onCheckedChange={(checked) =>
                handleFilterChange("in_collection", true, checked)
              }
            />
            <FilterCheckbox
              label="Not In Collection"
              checked={filters.not_in_collection || false}
              onCheckedChange={(checked) =>
                handleFilterChange("not_in_collection", true, checked)
              }
            />
          </FilterSection>
          <Separator />
        </>
      )}

      {/* Class Filter */}
      <FilterSection title="Class">
        {HeroClass.map((heroClass) => (
          <FilterCheckbox
            key={heroClass}
            label={heroClass}
            checked={filters.class?.includes(heroClass) || false}
            onCheckedChange={(checked) =>
              handleFilterChange("class", heroClass, checked)
            }
          />
        ))}
      </FilterSection>

      <Separator />

      {/* Faction Filter */}
      <FilterSection title="Faction">
        {HeroFaction.map((faction) => (
          <FilterCheckbox
            key={faction}
            label={faction}
            checked={filters.faction?.includes(faction) || false}
            onCheckedChange={(checked) =>
              handleFilterChange("faction", faction, checked)
            }
          />
        ))}
      </FilterSection>

      <Separator />

      {/* Main Stat Filter */}
      <FilterSection title="Main Stat">
        {HeroMainStat.map((stat) => (
          <FilterCheckbox
            key={stat}
            label={stat}
            checked={filters.main_stat?.includes(stat) || false}
            onCheckedChange={(checked) =>
              handleFilterChange("main_stat", stat, checked)
            }
          />
        ))}
      </FilterSection>

      <Separator />

      {/* Attack Type Filter */}
      <FilterSection title="Attack Type">
        {AttackType.map((type) => (
          <FilterCheckbox
            key={type}
            label={type}
            checked={filters.attack_type?.includes(type) || false}
            onCheckedChange={(checked) =>
              handleFilterChange("attack_type", type, checked)
            }
          />
        ))}
      </FilterSection>

      <Separator />

      {/* Stone Source Filter */}
      <FilterSection title="Stone Source" defaultOpen={false}>
        {StoneSource.map((source) => (
          <FilterCheckbox
            key={source}
            label={source}
            checked={filters.stone_source?.includes(source) || false}
            onCheckedChange={(checked) =>
              handleFilterChange("stone_source", source, checked)
            }
          />
        ))}
      </FilterSection>

      <Separator />

      {/* Weapon Buff Filter */}
      <FilterSection title="Weapon Team Buff" defaultOpen={false}>
        {WeaponTeamBuff.map((buff) => (
          <FilterCheckbox
            key={buff}
            label={buff}
            checked={filters.weapon_buff?.includes(buff) || false}
            onCheckedChange={(checked) =>
              handleFilterChange("weapon_buff", buff, checked)
            }
          />
        ))}
      </FilterSection>

      <Separator />

      {/* Book Artifact Filter */}
      <FilterSection title="Book Artifact" defaultOpen={false}>
        {ArtifactBookOptions.map((book) => (
          <FilterCheckbox
            key={book}
            label={book}
            checked={filters.book?.includes(book) || false}
            onCheckedChange={(checked) =>
              handleFilterChange("book", book, checked)
            }
          />
        ))}
      </FilterSection>

      <Separator />

      {/* Glyph Stat Filter */}
      <FilterSection title="Glyph Stat" defaultOpen={false}>
        {Stats.map((stat) => (
          <FilterCheckbox
            key={stat}
            label={stat}
            checked={filters.glyph_stat?.includes(stat) || false}
            onCheckedChange={(checked) =>
              handleFilterChange("glyph_stat", stat, checked)
            }
          />
        ))}
      </FilterSection>

      <Separator />

      {/* Skin Stat Filter */}
      <FilterSection title="Skin Stat" defaultOpen={false}>
        {Stats.map((stat) => (
          <FilterCheckbox
            key={stat}
            label={stat}
            checked={filters.skin_stat?.includes(stat) || false}
            onCheckedChange={(checked) =>
              handleFilterChange("skin_stat", stat, checked)
            }
          />
        ))}
      </FilterSection>
    </div>
  );
}

function FilterSection({
  title,
  children,
  defaultOpen = true,
}: {
  title: string;
  children: React.ReactNode;
  defaultOpen?: boolean;
}) {
  const [isOpen, setIsOpen] = useState(defaultOpen);

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger asChild>
        <Button
          variant="ghost"
          className="w-full justify-between p-0 hover:bg-transparent"
        >
          <h4 className="font-medium text-sm text-muted-foreground">{title}</h4>
          <ChevronDownIcon
            className={`size-4 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent className="space-y-2 mt-2">
        {children}
      </CollapsibleContent>
    </Collapsible>
  );
}

function FilterCheckbox({
  label,
  checked,
  onCheckedChange,
}: {
  label: string;
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center space-x-2">
      <Checkbox
        id={`filter-${label}`}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label
        htmlFor={`filter-${label}`}
        className="text-sm font-normal capitalize cursor-pointer"
      >
        {label}
      </Label>
    </div>
  );
}
