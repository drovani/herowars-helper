import { useMemo, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import EquipmentImage from "~/components/EquipmentImage";
import ItemSelectionDialog from "~/components/hero-form/ItemSelectionDialog";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { type EquipmentRecord } from "~/data/equipment.zod";
import { type HeroMutation, type HeroRecord } from "~/data/hero.zod";
import { HeroRankLevel } from "~/data/ReadonlyArrays";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";

interface ItemsFieldProps {
  form: UseFormReturn<HeroMutation>;
  hero: HeroRecord;
  equipment: EquipmentRecord[];
}

const ITEMS_PER_TIER = 6;

export default function ItemsField({ form, hero, equipment }: ItemsFieldProps) {
  const items = form.watch("items", hero.items);

  const [selectedSlot, setSelectedSlot] = useState<{
    quality: HeroRankLevel;
    slot: number;
  } | null>(null);

  const handleItemSelect = (
    quality: HeroRankLevel,
    slot: number,
    equipmentSlug: string | null
  ) => {
    const qualityItems = [
      ...(items?.[quality] || Array(ITEMS_PER_TIER).fill("")),
    ];
    qualityItems[slot] = equipmentSlug || "";

    form.setValue("items", {
      ...items,
      [quality]: qualityItems,
    });
  };

  const itemsSelected = useMemo(
    () => (items ? Object.values(items).flat().filter(Boolean).length : 0),
    [items]
  );
  const itemsTotal = HeroRankLevel.length * ITEMS_PER_TIER;

  const getEquipmentBySlug = (slug: string) => {
    return equipment.find((e) => e.slug === slug);
  };

  return (
    <FormField
      control={form.control}
      name="items"
      render={() => (
        <Accordion type="single" collapsible>
          <AccordionItem value="equipment">
            <AccordionTrigger>
              <FormLabel className="text-lg font-semibold">
                Equipment Needed ({itemsSelected}/{itemsTotal})
              </FormLabel>
            </AccordionTrigger>
            <AccordionContent>
              <FormItem>
                <div className="space-y-6">
                  {HeroRankLevel.map((rank) => {
                    const rankItems =
                      items?.[rank] || Array(ITEMS_PER_TIER).fill("");
                    const rankLabel = rank.includes("+")
                      ? rank.replace("+", " +")
                      : rank;

                    return (
                      <div key={rank} className="space-y-2">
                        <FormLabel
                          className={`text-base capitalize font-medium`}
                        >
                          {rankLabel}
                        </FormLabel>
                        <div className="grid grid-cols-2 gap-4 lg:grid-cols-6">
                          {Array.from({ length: ITEMS_PER_TIER }).map(
                            (_, slot) => {
                              const itemSlug = rankItems[slot];
                              const selectedEquipment = itemSlug
                                ? getEquipmentBySlug(itemSlug)
                                : null;

                              return (
                                <button
                                  key={slot}
                                  type="button"
                                  onClick={() =>
                                    setSelectedSlot({ quality: rank, slot })
                                  }
                                  className="size-16 relative hover:scale-110 transition-transform"
                                >
                                  {selectedEquipment ? (
                                    <EquipmentImage
                                      equipment={selectedEquipment}
                                      size="md"
                                    />
                                  ) : (
                                    <img
                                      src={`/images/equipment/border-${rank
                                        .split("+")[0]
                                        .replace("white", "gray")}.png`}
                                      alt={`Empty ${rank} slot`}
                                      className="size-full"
                                    />
                                  )}
                                </button>
                              );
                            }
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {selectedSlot && (
                  <ItemSelectionDialog
                    open={true}
                    onClose={() => setSelectedSlot(null)}
                    onSelect={(slug) => {
                      handleItemSelect(
                        selectedSlot.quality,
                        selectedSlot.slot,
                        slug
                      );
                      setSelectedSlot(null);
                    }}
                    equipment={equipment}
                    quality={selectedSlot.quality}
                  />
                )}
                <FormMessage />
              </FormItem>
            </AccordionContent>
          </AccordionItem>
        </Accordion>
      )}
    />
  );
}
