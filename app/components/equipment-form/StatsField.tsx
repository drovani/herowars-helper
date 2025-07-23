import { PlusCircleIcon, XIcon } from "lucide-react";
import { useRef, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { Button } from "~/components/ui/button";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "~/components/ui/popover";
import { type EquipmentMutation } from "~/data/equipment.zod";
import { Stats } from "~/data/ReadonlyArrays";
import { generateSlug } from "~/lib/utils";

interface StatsFieldProps {
  form: UseFormReturn<EquipmentMutation>;
  disabled?: boolean;
}

export default function StatsField({
  form,
  disabled = false,
}: StatsFieldProps) {
  const [open, setOpen] = useState(false);
  const [lastAddedStat, setLastAddedStat] = useState<string | null>(null);
  const inputRefs = useRef<Record<string, HTMLInputElement>>({});
  const stats = form.watch("stats") || {};

  // Get available stats (those not already selected)
  const availableStats = Stats.filter((stat) => !stats[stat]).sort();

  const onSelectStat = (stat: string) => {
    form.setValue("stats", {
      ...stats,
      [stat]: 0,
    });
    setOpen(false);
    setLastAddedStat(stat);
  };

  const handleCloseAutoFocus = (e: Event) => {
    e.preventDefault();
    if (lastAddedStat) {
      const input = inputRefs.current[lastAddedStat];
      input?.focus();
      input?.select();
    }
  };

  const removeStat = (stat: string) => {
    const newStats = { ...stats };
    delete newStats[stat];
    form.setValue("stats", newStats);
  };

  return (
    <FormField
      control={form.control}
      name="stats"
      render={() => (
        <FormItem className="space-y-4">
          <FormLabel>Stats</FormLabel>
          <div className="space-y-4 max-w-sm">
            {/* Existing stats */}
            {Object.entries(stats).map(([stat, value]) => (
              <div key={stat} className="flex items-center gap-2">
                <div className="flex items-center gap-2 w-40">
                  <img
                    src={`/images/stats/${generateSlug(stat)}.png`}
                    alt={stat}
                    className="w-6 h-6"
                  />
                  <span className="capitalize">{stat}</span>
                </div>
                <FormControl>
                  <Input
                    type="number"
                    value={value}
                    onChange={(e) => {
                      form.setValue("stats", {
                        ...stats,
                        [stat]: Number(e.target.value),
                      });
                    }}
                    ref={(el) => {
                      if (el) inputRefs.current[stat] = el;
                    }}
                    className="w-20"
                  />
                </FormControl>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => removeStat(stat)}
                >
                  <XIcon className="h-4 w-4" />
                </Button>
              </div>
            ))}

            {/* Add new stat */}
            <Popover open={open} onOpenChange={setOpen}>
              <PopoverTrigger
                asChild
                disabled={disabled || availableStats.length === 0}
              >
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  className="w-full"
                  disabled={disabled || availableStats.length === 0}
                >
                  <PlusCircleIcon className="h-4 w-4 mr-2" />
                  Add Stat
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-64"
                align="start"
                onCloseAutoFocus={handleCloseAutoFocus}
              >
                <div className="space-y-1 p-2">
                  {availableStats.map((stat) => (
                    <Button
                      key={stat}
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start font-normal"
                      onClick={() => onSelectStat(stat)}
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={`/images/stats/${generateSlug(stat)}.png`}
                          alt={stat}
                          className="w-6 h-6"
                        />
                        <span className="capitalize">{stat}</span>
                      </div>
                    </Button>
                  ))}
                </div>
              </PopoverContent>
            </Popover>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
