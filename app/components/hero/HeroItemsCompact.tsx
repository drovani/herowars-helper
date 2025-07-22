import { HoverCard } from "@radix-ui/react-hover-card";
import type { ClassValue } from "clsx";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { EquipmentRecord } from "~/data/equipment.zod";
import type { HeroRecord } from "~/data/hero.zod";
import { cn, generateSlug } from "~/lib/utils";
import EquipmentImage from "../EquipmentImage";
import { Badge } from "../ui/badge";
import { HoverCardContent, HoverCardTrigger } from "../ui/hover-card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface HeroItemsProps {
  equipment: EquipmentRecord[];
  items: HeroRecord["items"];
  className?: ClassValue;
}

type ItemRank = keyof NonNullable<HeroRecord["items"]>;

export default function HeroItemsCompact({
  items,
  equipment,
  className,
}: HeroItemsProps) {
  if (items === undefined) return <div></div>;

  const ranks = Object.keys(items);
  const [selectedRank, setSelectedRank] = useState<ItemRank>(
    ranks[0] as ItemRank
  );

  const getEquipment = (slug: string) => equipment.find((e) => e.slug === slug);

  if (!items || Object.keys(items).length === 0) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <AlertCircle className="h-4 w-4" />
        <span>No items configured for this hero</span>
      </div>
    );
  }

  return (
    <div className={cn("flex flex-col gap-2", className)}>
      <Select
        value={selectedRank}
        onValueChange={(value) => setSelectedRank(value as ItemRank)}
      >
        <SelectTrigger className="capitalize p-1 w-[118px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {ranks.map((rank, index) => (
            <SelectItem key={rank} value={rank} className="capitalize">
              Rank {index + 1}: {rank}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {items && items[selectedRank] ? (
        <div className="grid grid-cols-2 grid-flow-col grid-rows-3">
          {items[selectedRank].map((slug, index) => {
            const item = getEquipment(slug);
            return item ? (
              <HoverCard key={index}>
                <HoverCardTrigger asChild>
                  <Link
                    to={`/equipment/${slug}`}
                    className="group flex items-center gap-2"
                  >
                    <EquipmentImage equipment={item} size="md" />
                  </Link>
                </HoverCardTrigger>
                <HoverCardContent className="space-y-2">
                  <Link
                    to={`/equipment/${slug}`}
                    className="group flex items-center gap-2"
                  >
                    <div className="font-medium">{item.name}</div>
                  </Link>
                  <div className="flex gap-2">
                    <Link
                      to={`/equipment/${slug}`}
                      className="group flex items-center gap-2"
                    >
                      <EquipmentImage equipment={item} size="md" />
                    </Link>
                    <div>
                      {"stats" in item &&
                        Object.entries(item.stats).map(
                          ([stat, value], index) => (
                            <div
                              key={index}
                              className="flex items-center gap-2"
                            >
                              <img
                                src={`/images/stats/${generateSlug(stat)}.png`}
                                alt={stat}
                                className="w-6 h-6"
                              />
                              <span className="text-muted-foreground capitalize">
                                {stat} +{value}
                              </span>
                            </div>
                          )
                        )}
                    </div>
                    <div className="grid grid-cols-3 gap-2">
                      {"campaign_sources" in item &&
                        item.campaign_sources?.map((value) => (
                          <Link
                            to={`/missions/${value}`}
                            key={value}
                            viewTransition
                          >
                            <Badge
                              variant="outline"
                              className="capitalize hover:bg-muted"
                            >
                              {value}
                            </Badge>
                          </Link>
                        ))}
                    </div>
                  </div>
                </HoverCardContent>
              </HoverCard>
            ) : (
              <img
                src={`/images/equipment/border-${selectedRank
                  .split("+")[0]
                  .replace("white", "gray")}.png`}
                alt={`Empty ${selectedRank} slot`}
                className="size-16"
                key={index}
              />
            );
          })}
        </div>
      ) : (
        <div>No items specified for this rank.</div>
      )}
    </div>
  );
}
