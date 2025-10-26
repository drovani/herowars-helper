// heroes.$slug_.edit.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { data, redirect, type UIMatch } from "react-router";
import invariant from "tiny-invariant";
import log from "loglevel";
import { ZodError } from "zod";
import HeroForm from "~/components/HeroForm";
import { Badge } from "~/components/ui/badge";
import { HeroMutationSchema, type HeroMutation } from "~/data/hero.zod";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { HeroRepository } from "~/repositories/HeroRepository";
import { transformCompleteHeroToRecord } from "~/lib/hero-transformations";
import { createClient } from "~/lib/supabase/client";
import type { Route } from "./+types/slug.edit";

export const meta = ({ loaderData }: Route.MetaArgs) => {
  return [
    { title: `Edit ${loaderData?.hero.name}` },
    { name: "robots", content: "noindex" },
    { rel: "canonical", href: `/heroes/${loaderData?.hero.slug}` },
    {
      name: "description",
      content: `Edit details for ${loaderData?.hero.name} hero. Internal administrative page.`,
    },
  ];
};

export const handle = {
  breadcrumb: (
    matches: UIMatch<Route.ComponentProps["loaderData"], unknown>,
  ) => [
    {
      href: `/heroes/${matches.params.slug}`,
      title: matches.loaderData?.hero?.name || "Hero",
    },
    {
      title: "Edit",
    },
  ],
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.slug, "Missing hero slug param.");
  const heroRepo = new HeroRepository(request);
  const heroResult = await heroRepo.findWithAllData(params.slug);

  if (heroResult.error || !heroResult.data) {
    throw data(null, {
      status: 404,
      statusText: `Hero with slug ${params.slug} not found.`,
    });
  }

  const hero = transformCompleteHeroToRecord(heroResult.data);

  const equipmentRepo = new EquipmentRepository(request);
  const equipmentResult = await equipmentRepo.getAllAsJson();

  if (equipmentResult.error) {
    throw new Response("Failed to load equipment", { status: 500 });
  }

  return data(
    {
      hero,
      equipment:
        equipmentResult.data?.filter((eq) => eq.type === "equipable") || [],
    },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        Pragma: "no-cache",
      },
    },
  );
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  invariant(params.slug, "Missing hero slug param");

  const formData = await request.formData();
  const formDataObj = JSON.parse(formData.get("hero") as string);

  // Validate the data
  const parseResults = HeroMutationSchema.safeParse(formDataObj);
  if (!parseResults.success) {
    log.error(
      "Captured validation ZodError:",
      JSON.stringify(parseResults.error.format(), null, 2),
    );
    return data({ errors: parseResults.error.format() }, { status: 400 });
  }

  const heroRepo = new HeroRepository(request);
  const { supabase } = createClient(request);

  // Separate hero base data from related data
  const { artifacts, skins, glyphs, items, ...heroBaseData } =
    parseResults.data;

  // Update only the base hero fields (not related table data)
  const updateData = {
    ...heroBaseData,
    updated_on: new Date().toISOString(),
  };

  const updateResult = await heroRepo.update(params.slug, updateData);
  if (updateResult.error) {
    log.error(`Failed to update hero ${params.slug}:`, updateResult.error);
    return data(
      {
        errors: {
          _form: [`Failed to update hero: ${updateResult.error.message}`],
        },
      },
      { status: 500 },
    );
  }

  if (!updateResult.data) {
    return data(
      { errors: { _form: [`Failed to update hero: No data returned`] } },
      { status: 500 },
    );
  }

  // Update related data (artifacts, skins, glyphs, items)
  // These are handled by deleting old records and creating new ones
  // This approach ensures consistency and avoids complex merge logic

  if (artifacts) {
    // Clear existing artifacts by deleting them
    await supabase
      .from("hero_artifact")
      .delete()
      .eq("hero_slug", params.slug);

    // Insert new artifacts
    const artifactData: Array<{
      hero_slug: string;
      artifact_type: string;
      name: string | null;
      team_buff: string | null;
      team_buff_secondary: string | null;
    }> = [];

    if (artifacts.weapon) {
      artifactData.push({
        hero_slug: params.slug,
        artifact_type: "weapon",
        name: artifacts.weapon.name,
        team_buff: artifacts.weapon.team_buff,
        team_buff_secondary: artifacts.weapon.team_buff_secondary || null,
      });
    }

    if (artifacts.book) {
      artifactData.push({
        hero_slug: params.slug,
        artifact_type: "book",
        name: artifacts.book,
        team_buff: null,
        team_buff_secondary: null,
      });
    }

    if (artifacts.ring) {
      artifactData.push({
        hero_slug: params.slug,
        artifact_type: "ring",
        name: null,
        team_buff: null,
        team_buff_secondary: null,
      });
    }

    if (artifactData.length > 0) {
      const { error: artifactError } = await supabase
        .from("hero_artifact")
        .insert(artifactData);
      if (artifactError) {
        log.error(`Failed to update artifacts for ${params.slug}:`, artifactError);
      }
    }
  }

  if (skins && skins.length > 0) {
    // Delete existing skins and create new ones
    await supabase
      .from("hero_skin")
      .delete()
      .eq("hero_slug", params.slug);

    const skinData = skins.map((skin) => ({
      hero_slug: params.slug,
      name: skin.name,
      stat_type: skin.stat,
      stat_value: 0,
      has_plus: skin.has_plus,
      source: skin.source || null,
    }));

    const { error: skinError } = await supabase
      .from("hero_skin")
      .insert(skinData);
    if (skinError) {
      log.error(`Failed to update skins for ${params.slug}:`, skinError);
    }
  }

  if (glyphs && glyphs.length > 0) {
    // Delete existing glyphs and create new ones
    await supabase
      .from("hero_glyph")
      .delete()
      .eq("hero_slug", params.slug);

    const glyphData: Array<{
      hero_slug: string;
      position: number;
      stat_type: string;
      stat_value: number;
    }> = [];

    glyphs.forEach((stat, index) => {
      if (stat !== null && stat !== undefined) {
        glyphData.push({
          hero_slug: params.slug,
          position: index + 1,
          stat_type: stat,
          stat_value: 0,
        });
      }
    });

    if (glyphData.length > 0) {
      const { error: glyphError } = await supabase
        .from("hero_glyph")
        .insert(glyphData);
      if (glyphError) {
        log.error(`Failed to update glyphs for ${params.slug}:`, glyphError);
      }
    }
  }

  if (items) {
    // Delete existing equipment slots and create new ones
    await supabase
      .from("hero_equipment_slot")
      .delete()
      .eq("hero_slug", params.slug);

    const equipmentData: Array<{
      hero_slug: string;
      quality: string;
      slot_position: number;
      equipment_slug: string | null;
    }> = [];

    for (const [quality, equipmentArray] of Object.entries(items)) {
      if (Array.isArray(equipmentArray)) {
        equipmentArray.forEach((equipmentSlug, slotIndex) => {
          equipmentData.push({
            hero_slug: params.slug,
            quality,
            slot_position: slotIndex + 1,
            equipment_slug: equipmentSlug || null,
          });
        });
      }
    }

    if (equipmentData.length > 0) {
      const { error: equipmentError } = await supabase
        .from("hero_equipment_slot")
        .insert(equipmentData);
      if (equipmentError) {
        log.error(`Failed to update equipment for ${params.slug}:`, equipmentError);
      }
    }
  }

  return redirect(`/heroes/${updateResult.data.slug}`);
};

export default function EditHero({
  loaderData,
  actionData,
}: Route.ComponentProps) {
  const { hero, equipment } = loaderData;

  const form = useForm<HeroMutation>({
    resolver: zodResolver(HeroMutationSchema),
    defaultValues: {
      ...hero,
      skins: hero.skins || [{ name: "Default Skin", stat: undefined }],
      glyphs: hero.glyphs || [
        undefined,
        undefined,
        undefined,
        undefined,
        hero.main_stat,
      ],
    },
  });

  return (
    <div className="space-y-6">
      {/* Hero Info Header */}
      <div className="flex items-center gap-4">
        <img
          src={`/images/heroes/${hero.slug}.png`}
          alt={hero.name}
          className="size-24 rounded-lg bg-muted"
        />
        <div>
          <h1 className="text-3xl font-bold mb-2">{hero.name}</h1>
          <div className="flex gap-2">
            <Badge variant="secondary" className="capitalize">
              {hero.class}
            </Badge>
            <Badge variant="outline" className="capitalize">
              {hero.faction}
            </Badge>
            <div className="capitalize flex gap-1 items-center">
              <img
                src={`/images/stats/${hero.main_stat}.png`}
                alt={hero.main_stat}
                className="size-4 inline-block"
              />
              {hero.main_stat}
            </div>
          </div>
        </div>
      </div>
      <HeroForm form={form} hero={hero} equipment={equipment} />
    </div>
  );
}
