import { useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { Card, CardContent, CardHeader, CardTitle } from "~/components/ui/card";
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
  SelectValue,
} from "~/components/ui/select";
import type { HeroMutation, HeroRecord } from "~/data/hero.zod";
import { ArtifactBookStats, WeaponTeamBuff } from "~/data/ReadonlyArrays";
import { cn, generateSlug } from "~/lib/utils";

interface ArtifactsFieldProps {
  form: UseFormReturn<HeroMutation>;
  hero: HeroRecord;
}

function StatDisplay({ stat, prefix }: { stat: string; prefix?: string }) {
  return (
    <div className="flex items-center gap-1 text-nowrap">
      <img
        src={`/images/stats/${generateSlug(stat)}.png`}
        alt={stat}
        className="size-6"
      />
      {prefix && <span>{prefix}</span>}
      <span className="capitalize">{stat}</span>
    </div>
  );
}

function BookDisplay({ book }: { book: string }) {
  return (
    <div className="flex items-center gap-1 text-nowrap">
      <img
        src={`/images/heroes/artifacts/${generateSlug(book)}.png`}
        alt={book}
        className="size-6 rounded-sm"
      />
      <span className="capitalize">{book}</span>
    </div>
  );
}

export default function ArtifactsField({ form, hero }: ArtifactsFieldProps) {
  const artifacts = form.watch("artifacts", hero.artifacts);

  const availableWeaponStats = [...WeaponTeamBuff].sort((a, b) =>
    a.localeCompare(b)
  );
  const availableBooks = Object.keys(ArtifactBookStats).sort();

  // Get the second buff value for UI display, returning "none" if not present
  const [buff2Selection, setBuff2Selection] = useState<string | undefined>(
    () => {
      return form.getValues("artifacts.weapon.team_buff_secondary");
    }
  );

  return (
    <FormField
      control={form.control}
      name="artifacts"
      render={() => (
        <FormItem className="space-y-4">
          <FormLabel className="text-lg font-semibold">
            Hero Artifacts
          </FormLabel>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Weapon Card */}
            <Card>
              <CardHeader>
                <CardTitle>
                  <FormField
                    control={form.control}
                    name="artifacts.weapon.name"
                    render={({ field }) => (
                      <div className="flex flex-col gap-2">
                        <div className="flex flex-col items-center">
                          <img
                            src={`/images/heroes/artifacts/${generateSlug(
                              artifacts?.weapon?.name
                            )}.png`}
                            alt={artifacts?.weapon?.name}
                            className="size-16 object-contain rounded-md"
                            onError={(e) =>
                              (e.currentTarget.src =
                                "/images/heroes/artifacts/weapon-name.png")
                            }
                          />
                          <Input
                            {...field}
                            placeholder="Weapon Name"
                            className="mt-1 font-normal"
                          />
                        </div>
                        <FormMessage />
                      </div>
                    )}
                  />
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col items-center gap-4">
                  <div className="w-full">
                    <FormLabel className="text-sm">Team Buff 1</FormLabel>
                    <FormField
                      control={form.control}
                      name="artifacts.weapon.team_buff"
                      render={({ field }) => (
                        <div className="flex flex-col gap-2">
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              {field.value ? (
                                <StatDisplay stat={field.value} />
                              ) : (
                                <SelectValue placeholder="Select stat" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {availableWeaponStats.map((stat) => (
                                <SelectItem key={stat} value={stat}>
                                  <StatDisplay stat={stat} />
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      )}
                    />
                  </div>

                  <div className="w-full">
                    <FormLabel
                      className={cn(
                        "text-sm",
                        form.watch("artifacts.weapon.team_buff") ===
                          undefined && "opacity-50"
                      )}
                    >
                      Team Buff 2
                    </FormLabel>
                    <FormField
                      control={form.control}
                      name="artifacts.weapon.team_buff_secondary"
                      render={({ field }) => (
                        <div className="flex flex-col gap-2">
                          <Select
                            value={buff2Selection}
                            onValueChange={(newValue) => {
                              setBuff2Selection(newValue);
                              if (newValue === "none") {
                                form.resetField(
                                  "artifacts.weapon.team_buff_secondary",
                                  undefined
                                );
                              } else {
                                field.onChange(newValue);
                              }
                            }}
                            disabled={
                              form.watch("artifacts.weapon.team_buff") ===
                              undefined
                            }
                          >
                            <SelectTrigger>
                              {buff2Selection !== "none" &&
                              buff2Selection !== undefined ? (
                                <StatDisplay stat={buff2Selection} />
                              ) : (
                                <span className="text-muted-foreground">
                                  None
                                </span>
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="none">
                                <span className="text-muted-foreground">
                                  None
                                </span>
                              </SelectItem>
                              {availableWeaponStats.map((stat) => (
                                <SelectItem
                                  key={stat}
                                  value={stat}
                                  disabled={
                                    stat ===
                                    form.watch("artifacts.weapon.team_buff")
                                  }
                                >
                                  <StatDisplay stat={stat} />
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      )}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Book Card */}
            <Card>
              <CardContent className="pt-6 space-y-4">
                <div className="flex flex-col items-center gap-2">
                  <img
                    src={`/images/heroes/artifacts/${generateSlug(
                      artifacts?.book || "default-book"
                    )}.png`}
                    alt={artifacts?.book || "Book"}
                    className="size-16 object-contain rounded-md"
                    onError={(e) =>
                      (e.currentTarget.src =
                        "/images/heroes/artifacts/default-book.png")
                    }
                  />
                  <div className="flex-1 w-full">
                    <FormField
                      control={form.control}
                      name="artifacts.book"
                      render={({ field }) => (
                        <div className="flex flex-col gap-2">
                          <Select
                            value={field.value}
                            onValueChange={field.onChange}
                          >
                            <SelectTrigger>
                              {field.value ? (
                                <span className="capitalize">
                                  {field.value}
                                </span>
                              ) : (
                                <SelectValue placeholder="Select artifact book" />
                              )}
                            </SelectTrigger>
                            <SelectContent>
                              {availableBooks.map((book) => (
                                <SelectItem key={book} value={book}>
                                  <BookDisplay book={book} />
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </div>
                      )}
                    />
                  </div>
                </div>
                <div className="flex flex-col gap-2">
                  {artifacts?.book &&
                    ArtifactBookStats[artifacts.book].map((stat) => (
                      <StatDisplay key={stat} stat={stat} />
                    ))}
                </div>
              </CardContent>
            </Card>

            {/* Ring Card */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={`/images/heroes/artifacts/ring-of-${hero.main_stat}.png`}
                    alt={`Ring of ${hero.main_stat}`}
                    className="size-16 object-contain rounded-md"
                  />
                  <StatDisplay stat={hero.main_stat} prefix="Ring of" />
                </div>
              </CardContent>
            </Card>
          </div>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}
