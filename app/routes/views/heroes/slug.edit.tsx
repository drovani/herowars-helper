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
import { createDatabaseHeroService } from "~/services/DatabaseHeroService";
import type { Route } from "./+types/slug.edit";

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    { title: `Edit ${data?.hero.name}` },
    { name: "robots", content: "noindex" },
    { rel: "canonical", href: `/heroes/${data?.hero.slug}` },
    {
      name: "description",
      content: `Edit details for ${data?.hero.name} hero. Internal administrative page.`,
    },
  ];
};

export const handle = {
  breadcrumb: (matches: UIMatch<Route.ComponentProps["loaderData"], unknown>) => [
    {
      href: `/heroes/${matches.params.slug}`,
      title: matches.data?.hero?.name || "Hero",
    },
    {
      title: "Edit",
    },
  ],
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.slug, "Missing hero slug param.");
  const heroService = createDatabaseHeroService(request);
  const hero = await heroService.getById(params.slug);
  if (!hero) {
    throw data(null, {
      status: 404,
      statusText: `Hero with slug ${params.slug} not found.`,
    });
  }

  const equipmentRepo = new EquipmentRepository(request);
  const equipmentResult = await equipmentRepo.getAllAsJson();

  if (equipmentResult.error) {
    throw new Response("Failed to load equipment", { status: 500 });
  }

  return data(
    { hero, equipment: equipmentResult.data?.filter(eq => eq.type === "equipable") || [] },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  invariant(params.slug, "Missing hero slug param");

  const formData = await request.formData();
  const data = JSON.parse(formData.get("hero") as string);
  const dustedData = {
    ...data,
    glyphs: data.glyphs.map((glyph: string | null | undefined) => glyph || undefined),
    artifact: {
      ...data.artifact,
      ring: null,
    },
  };

  const heroService = createDatabaseHeroService(request);
  const updateResults = await heroService.update(params.slug, dustedData as HeroMutation);
  if (updateResults instanceof ZodError) {
    log.error("Captured validation ZodError:", JSON.stringify(updateResults.format(), null, 2));
    return data({ errors: updateResults.format() }, { status: 400 });
  }

  return redirect(`/heroes/${updateResults.slug}`);
};

export default function EditHero({ loaderData, actionData }: Route.ComponentProps) {
  const { hero, equipment } = loaderData;

  const form = useForm<HeroMutation>({
    resolver: zodResolver(HeroMutationSchema),
    defaultValues: {
      ...hero,
      skins: hero.skins || [{ name: "Default Skin", stat: undefined }],
      glyphs: hero.glyphs || [undefined, undefined, undefined, undefined, hero.main_stat],
    },
  });

  return (
    <div className="space-y-6">
      {/* Hero Info Header */}
      <div className="flex items-center gap-4">
        <img src={`/images/heroes/${hero.slug}.png`} alt={hero.name} className="size-24 rounded-lg bg-muted" />
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
              <img src={`/images/stats/${hero.main_stat}.png`} alt={hero.main_stat} className="size-4 inline-block" />
              {hero.main_stat}
            </div>
          </div>
        </div>
      </div>
      <HeroForm form={form} hero={hero} equipment={equipment} />
    </div>
  );
}
