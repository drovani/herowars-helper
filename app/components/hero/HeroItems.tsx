import type { ClassValue } from "clsx";
import { AlertCircle } from "lucide-react";
import { useState } from "react";
import { Link } from "react-router";
import type { EquipmentRecord } from "~/data/equipment.zod";
import type { HeroRecord } from "~/data/hero.zod";
import { cn } from "~/lib/utils";
import EquipmentImage from "../EquipmentImage";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
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

export default function HeroItems({
  items,
  equipment,
  className,
}: HeroItemsProps) {
  if (items === undefined) return <div className={cn(className)}></div>;

  const ranks = Object.keys(items);
  const [selectedRank, setSelectedRank] = useState<ItemRank>(
    ranks[0] as ItemRank
  );

  const getEquipment = (slug: string) => equipment.find((e) => e.slug === slug);

  if (!items || Object.keys(items).length === 0) {
    return (
      <div
        className={cn(
          "flex items-center gap-2 text-muted-foreground",
          className
        )}
      >
        <AlertCircle className="h-4 w-4" />
        <span>No items configured for this hero</span>
      </div>
    );
  }

  return (
    <Card className={cn(className)}>
      <CardHeader>
        <div className="flex gap-4 items-center">
          <CardTitle>Equipment Ranks:</CardTitle>
          <Select
            value={selectedRank}
            onValueChange={(value) => setSelectedRank(value as ItemRank)}
          >
            <SelectTrigger className="w-48 capitalize">
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
        </div>
      </CardHeader>
      <CardContent>
        {items && items[selectedRank] ? (
          <div className="grid grid-cols-2 grid-flow-col grid-rows-3">
            {items[selectedRank].map((slug, index) => {
              const item = getEquipment(slug);
              return item ? (
                <Link
                  to={`/equipment/${slug}`}
                  key={index}
                  className="group flex items-center gap-2"
                >
                  <EquipmentImage equipment={item} size="md" />
                  <span className="group-hover:underline">{item.name}</span>
                </Link>
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
      </CardContent>
    </Card>
  );
}
