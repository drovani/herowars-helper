//components/hero-form/SkinsField.tsx
import type { CheckedState } from "@radix-ui/react-checkbox";
import { PlusCircleIcon, XIcon } from "lucide-react";
import { useRef } from "react";
import { type UseFormReturn } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
} from "~/components/ui/select";
import { type HeroMutation, type HeroRecord } from "~/data/hero.zod";
import { Stats } from "~/data/ReadonlyArrays";
import { generateSlug } from "~/lib/utils";
import { Checkbox } from "../ui/checkbox";

function StatDisplay({ stat }: { stat: string }) {
  return (
    <div className="flex items-center gap-2">
      {stat && (
        <img
          src={`/images/stats/${generateSlug(stat)}.png`}
          alt={stat}
          className="w-6 h-6"
        />
      )}
      <span className="capitalize">{stat}</span>
    </div>
  );
}

interface SkinsFieldProps {
  form: UseFormReturn<HeroMutation>;
  hero: HeroRecord;
}

export default function SkinsField({ form, hero }: SkinsFieldProps) {
  const skins = form.watch("skins", hero.skins);
  if (skins === undefined) throw new Error("Skins are undefined");

  const inputRefs = useRef<Record<number, HTMLInputElement>>({});

  const theOtherMainStats = ["strength", "agility", "intelligence"].filter(
    (stat) => stat !== hero.main_stat
  );
  const availableStats = Stats.map((stat) => ({
    stat,
    disabled: theOtherMainStats.includes(stat),
  })).sort((l, r) => l.stat.localeCompare(r.stat));

  const addSkin = () => {
    const newIndex = skins.length;
    form.setValue("skins", [...skins, { name: "", stat: "health" }]);
    // Use setTimeout to ensure the input element is rendered
    setTimeout(() => {
      inputRefs.current[newIndex]?.focus();
    }, 0);
  };

  const removeSkin = (index: number) => {
    if (index === 0) return; // Prevent removing default skin
    const newSkins = [...skins];
    newSkins.splice(index, 1);
    form.setValue("skins", newSkins);
  };

  const updateSkinName = (index: number, name: string) => {
    const newSkins = [...skins];
    newSkins[index] = { ...newSkins[index], name };
    form.setValue("skins", newSkins);
  };

  const updateSkinHasPlus = (index: number, has_plus: CheckedState) => {
    if (has_plus === "indeterminate") return;

    const newSkins = [...skins];
    newSkins[index] = { ...newSkins[index], has_plus };
    form.setValue("skins", newSkins);
  };

  const updateSkinStat = (index: number, stat: (typeof Stats)[number]) => {
    const newSkins = [...skins];
    newSkins[index] = { ...newSkins[index], stat };
    form.setValue("skins", newSkins);
  };

  return (
    <FormField
      control={form.control}
      name="skins"
      render={() => (
        <FormItem className="space-y-4">
          <FormLabel className="text-lg font-semibold">Hero Skins</FormLabel>
          <div className="space-y-2 rounded-lg border p-4">
            <div className="grid grid-cols-[1fr_40px_160px_40px] gap-4 items-center mb-4">
              <FormLabel className="text-sm text-muted-foreground">
                Name
              </FormLabel>
              <FormLabel className="text-sm text-muted-foreground -ml-10">
                Has Plus
              </FormLabel>
              <FormLabel className="text-sm text-muted-foreground">
                Stat Boost
              </FormLabel>
              <div /> {/* Spacer for action button column */}
            </div>
            <div className="space-y-2">
              {skins.map((skin, index) => (
                <FormField
                  control={form.control}
                  key={`skins.${index}`}
                  name={`skins.${index}`}
                  defaultValue={skin}
                  render={() => (
                    <div
                      key={index}
                      className="grid grid-cols-[1fr_15px_185px_40px] gap-4 items-center"
                    >
                      {index === 0 ? (
                        <div className="font-medium">{skin.name}</div>
                      ) : (
                        <FormField
                          control={form.control}
                          name={`skins.${index}.name`}
                          defaultValue={skin.stat}
                          render={() => (
                            <Input
                              ref={(el) => {
                                if (el) inputRefs.current[index] = el;
                              }}
                              value={skin.name}
                              onChange={(e) =>
                                updateSkinName(index, e.target.value)
                              }
                              placeholder="Enter skin name"
                            />
                          )}
                        />
                      )}
                      <Checkbox
                        defaultChecked={skin.has_plus}
                        onCheckedChange={(checked) =>
                          updateSkinHasPlus(index, checked)
                        }
                      />
                      <FormField
                        control={form.control}
                        name={`skins.${index}.stat`}
                        defaultValue={skin.stat}
                        render={({ fieldState }) => (
                          <div>
                            <Select
                              value={skin.stat}
                              onValueChange={(value) =>
                                updateSkinStat(
                                  index,
                                  value as (typeof Stats)[number]
                                )
                              }
                            >
                              <SelectTrigger
                                className={fieldState.error && "border-red-500"}
                              >
                                <StatDisplay stat={skin.stat} />
                              </SelectTrigger>
                              <SelectContent>
                                {availableStats.map((stat) => (
                                  <SelectItem
                                    key={stat.stat}
                                    value={stat.stat}
                                    disabled={stat.disabled}
                                  >
                                    <StatDisplay stat={stat.stat} />
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </div>
                        )}
                      />
                      {index !== 0 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => removeSkin(index)}
                          className="h-8 w-8"
                        >
                          <XIcon className="h-4 w-4" />
                        </Button>
                      )}
                      {index === 0 && <div />}{" "}
                      {/* Empty space for consistent grid */}
                    </div>
                  )}
                />
              ))}
            </div>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={addSkin}
              className="w-full mt-4"
            >
              <PlusCircleIcon className="mr-2 h-4 w-4" />
              Add Skin
            </Button>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
