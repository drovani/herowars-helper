import { useEffect, useMemo, useState } from "react";
import { type UseFormReturn } from "react-hook-form";
import { data, useNavigate, useSubmit } from "react-router";
import { ZodError } from "zod";
import log from "loglevel";
import CampaignSourcesField from "~/components/equipment-form/CampaignSourcesField";
import CraftingField from "~/components/equipment-form/CraftingField";
import StatsField from "~/components/equipment-form/StatsField";
import EquipmentImage from "~/components/EquipmentImage";
import { Button } from "~/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "~/components/ui/form";
import { Input } from "~/components/ui/input";
import { Label } from "~/components/ui/label";
import { RadioGroup, RadioGroupItem } from "~/components/ui/radio-group";
import { Slider } from "~/components/ui/slider";
import {
  EQUIPMENT_QUALITIES,
  type EquipmentMutation,
  EquipmentMutationSchema,
  type EquipmentRecord,
} from "~/data/equipment.zod";
import type { MissionRecord } from "~/data/mission.zod";
import { generateSlug } from "~/lib/utils";

type EquipmentFormProps = {
  form: UseFormReturn<EquipmentMutation>;
  existingItems: EquipmentRecord[];
  missions: MissionRecord[];
};

export default function EquipmentForm({ form, existingItems, missions }: EquipmentFormProps) {
  const navigate = useNavigate();
  const submit = useSubmit();

  const [previewSlug, setPreviewSlug] = useState(form.getValues("name") ? generateSlug(form.getValues("name")) : "");
  const itemType = form.watch("type");
  const isFragment = useMemo(() => itemType === "fragment", [itemType]);
  const isRecipe = useMemo(() => itemType === "recipe", [itemType]);

  useEffect(() => {
    const name = form.getValues("name");
    if (!name) return;

    if (isFragment && !name.endsWith(" (Fragment)")) {
      form.setValue("name", `${name} (Fragment)`);
    }
    setPreviewSlug(generateSlug(form.getValues("name")));
  }, [isFragment, isRecipe, form]);

  useEffect(() => {
    const quality = form.getValues("quality");
    if (isFragment && quality === "gray") {
      form.setValue("quality", "green");
    }
  }, [isFragment, form]);

  useEffect(() => {
    const subscription = form.watch((value, { name }) => {
      if (name === "name" && value.name) {
        setPreviewSlug(generateSlug(value.name));
      }
    });
    return () => subscription.unsubscribe();
  }, [form, isFragment, isRecipe]);

  const onSubmit = (submittedData: EquipmentMutation) => {
    try {
      const validated = EquipmentMutationSchema.parse(submittedData);

      const formData = new FormData();
      formData.append("equipment", JSON.stringify(validated));
      submit(formData, { method: "post" });
    } catch (error) {
      log.error(error);
      if (error instanceof ZodError) {
        return data({ errors: error.format() }, { status: 400 });
      }
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
        <div className="flex flex-col  gap-4">
          <div className="flex-1">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input {...field} autoFocus />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="flex gap-4 items-center justify-around">
            <FormField
              control={form.control}
              name="type"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Special Type</FormLabel>
                  <FormControl>
                    <RadioGroup
                      onValueChange={field.onChange}
                      defaultValue={field.value || "equipable"}
                      className="flex flex-col gap-0"
                    >
                      <FormItem className="flex items-center gap-1">
                        <FormControl>
                          <RadioGroupItem value="equipable" />
                        </FormControl>
                        <FormLabel>Normal equipment</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-1">
                        <FormControl>
                          <RadioGroupItem value="recipe" />
                        </FormControl>
                        <FormLabel>Recipe</FormLabel>
                      </FormItem>
                      <FormItem className="flex items-center gap-1">
                        <FormControl>
                          <RadioGroupItem value="fragment" />
                        </FormControl>
                        <FormLabel>Fragment</FormLabel>
                      </FormItem>
                    </RadioGroup>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <EquipmentImage
              equipment={{
                name: form.watch("name"),
                slug: previewSlug,
                quality: form.watch("quality"),
                type: isFragment ? "fragment" : "equipable",
              }}
              size="lg"
            />
          </div>
        </div>

        <FormField
          control={form.control}
          name="quality"
          render={({ field }) => (
            <FormItem className="space-y-2">
              <FormLabel>Quality</FormLabel>
              <FormControl>
                <RadioGroup onValueChange={field.onChange} value={field.value} className="flex gap-4">
                  {EQUIPMENT_QUALITIES.map((quality) => (
                    <div key={quality} className="flex items-center space-x-2">
                      <RadioGroupItem value={quality} id={quality} />
                      <Label htmlFor={quality} className="capitalize">
                        {quality}
                      </Label>
                    </div>
                  ))}
                </RadioGroup>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="hero_level_required"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Hero Level Required</FormLabel>
              <div className="flex gap-4 items-center">
                <FormControl className="flex-1">
                  <Slider
                    min={1}
                    max={120}
                    step={1}
                    value={[field.value]}
                    onValueChange={([value]) => field.onChange(value)}
                    disabled={isFragment || isRecipe}
                  />
                </FormControl>
                <FormControl className="w-20">
                  <Input
                    type="number"
                    min={1}
                    max={120}
                    {...field}
                    onChange={(e) => field.onChange(+e.target.value)}
                    disabled={isFragment || isRecipe}
                  />
                </FormControl>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="space-y-4 md:space-y-0 md:grid md:grid-cols-3 md:gap-4">
          <FormField
            control={form.control}
            name="buy_value_gold"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buy Value (Gold)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : +e.target.value)}
                      className="pl-10"
                    />
                    <img
                      src="/images/gold.webp"
                      alt="Gold"
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="buy_value_coin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Buy Value (Merchant Coins)</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      type="number"
                      {...field}
                      value={field.value ?? ""}
                      onChange={(e) => field.onChange(e.target.value === "" ? null : +e.target.value)}
                      className="pl-10"
                    />
                    <img
                      src="/images/arena-coin.png"
                      alt="Merchant Coin"
                      className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full"
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4 md:col-span-2">
            <FormField
              control={form.control}
              name="sell_value"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sell Value</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : +e.target.value)}
                        className="pl-10"
                      />
                      <img
                        src="/images/gold.webp"
                        alt="Gold"
                        className="absolute left-1 top-1/2 -translate-y-1/2 w-8 h-8"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guild_activity_points"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guild Activity Points</FormLabel>
                  <FormControl>
                    <div className="relative">
                      <Input
                        type="number"
                        {...field}
                        onChange={(e) => field.onChange(e.target.value === "" ? null : +e.target.value)}
                        className="pl-10"
                      />
                      <img
                        src="/images/guild_activity_points.webp"
                        alt="Guild Activity Points"
                        className="absolute left-1 top-1/2 -translate-y-1/2 w-7 h-7"
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <StatsField form={form} disabled={isFragment || isRecipe} />
        <CraftingField form={form} existingItems={existingItems} disabled={isFragment} />
        <CampaignSourcesField form={form} missions={missions} />

        <div className="flex gap-4">
          <Button type="submit">Save Equipment</Button>
          <Button type="button" variant="outline" onClick={() => navigate(-1)}>
            Cancel
          </Button>
        </div>
      </form>
    </Form>
  );
}
