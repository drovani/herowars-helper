// heroes.$slug_.edit.tsx
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { data, redirect, type UIMatch } from "react-router";
import invariant from "tiny-invariant";
import log from "loglevel";
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

  const { supabase } = createClient(request);

  // Separate hero base data from related data
  const { artifacts, skins, glyphs, items, ...heroBaseData } =
    parseResults.data;

  // Prepare artifact data for RPC call
  const artifactData = artifacts
    ? [
        ...(artifacts.weapon
          ? [
              {
                artifact_type: "weapon",
                name: artifacts.weapon.name,
                team_buff: artifacts.weapon.team_buff,
                team_buff_secondary: artifacts.weapon.team_buff_secondary || null,
              },
            ]
          : []),
        ...(artifacts.book
          ? [
              {
                artifact_type: "book",
                name: artifacts.book,
                team_buff: null,
                team_buff_secondary: null,
              },
            ]
          : []),
        ...(artifacts.ring
          ? [
              {
                artifact_type: "ring",
                name: null,
                team_buff: null,
                team_buff_secondary: null,
              },
            ]
          : []),
      ]
    : null;

  // Prepare skin data for RPC call
  const skinData =
    skins && skins.length > 0
      ? skins.map((skin) => ({
          name: skin.name,
          stat_type: skin.stat,
          stat_value: 0,
          has_plus: skin.has_plus,
          source: skin.source || null,
        }))
      : null;

  // Prepare glyph data for RPC call
  const glyphData =
    glyphs && glyphs.length > 0
      ? glyphs
          .map((stat, index) =>
            stat !== null && stat !== undefined
              ? {
                  position: index + 1,
                  stat_type: stat,
                  stat_value: 0,
                }
              : null,
          )
          .filter((g) => g !== null)
      : null;

  // Prepare equipment data for RPC call
  const equipmentData = items
    ? Object.entries(items).flatMap(([quality, equipmentArray]) =>
        Array.isArray(equipmentArray)
          ? equipmentArray.map((equipmentSlug, slotIndex) => ({
              quality,
              slot_position: slotIndex + 1,
              equipment_slug: equipmentSlug || null,
            }))
          : [],
      )
    : null;

  // Call the atomic update function via RPC
  // This ensures all updates happen in a single transaction
  const { data: rpcResult, error: rpcError } = await supabase.rpc(
    "update_hero_with_relations",
    {
      p_hero_slug: params.slug,
      p_hero_data: heroBaseData,
      p_artifacts: artifactData,
      p_skins: skinData,
      p_glyphs: glyphData,
      p_equipment: equipmentData,
    },
  );

  if (rpcError) {
    log.error(`Failed to update hero ${params.slug}:`, rpcError);
    return data(
      {
        errors: {
          _form: [`Failed to update hero: ${rpcError.message}`],
        },
      },
      { status: 500 },
    );
  }

  if (!rpcResult) {
    return data(
      { errors: { _form: [`Failed to update hero: No data returned`] } },
      { status: 500 },
    );
  }

  return redirect(`/heroes/${rpcResult.slug}`);
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
