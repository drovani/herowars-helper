import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { data, redirect, type UIMatch } from "react-router";
import invariant from "tiny-invariant";
import { ZodError } from "zod";
import EquipmentForm from "~/components/EquipmentForm";
import { EquipmentMutationSchema, type EquipmentMutation } from "~/data/equipment.zod";
import EquipmentDataService from "~/services/EquipmentDataService";
import { MissionRepository } from "~/repositories/MissionRepository";
import type { Route } from "./+types/equipment.$slug_.edit";

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    { title: `Edit ${data?.equipment.name}` },
    { name: "robots", content: "noindex" },
    { rel: "canonical", href: `/equipment/${data?.equipment.slug}` },
    {
      name: "description",
      content: `Edit details for ${data?.equipment.name} item. Internal administrative page.`,
    },
  ];
};

export const handle = {
  breadcrumb: (matches: UIMatch<Route.ComponentProps["loaderData"], unknown>) => [
    {
      href: `/equipment/${matches.data.equipment.slug}`,
      title: matches.data.equipment.name,
    },
    {
      title: "Edit",
    },
  ],
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.slug, "Missing equipment slug param.");
  const equipment = await EquipmentDataService.getById(params.slug);
  if (!equipment) {
    throw new Response(null, {
      status: 404,
      statusText: `Equipment with slug ${params.slug} not found.`,
    });
  }

  const missionRepo = new MissionRepository(request);
  const [missionsResult, existingItems] = await Promise.all([
    missionRepo.findAll({ orderBy: { column: "slug", ascending: true } }),
    EquipmentDataService.getAll()
  ]);

  if (missionsResult.error) {
    throw new Response("Failed to load missions", { status: 500 });
  }

  const missions = missionsResult.data || [];
  
  // Convert Mission[] to MissionRecord[] for compatibility with existing components
  const allMissions = missions.map(mission => ({
    id: mission.slug,
    chapter: mission.chapter_id,
    chapter_title: "", // We'd need to fetch this from chapters table
    mission_number: parseInt(mission.slug.split('-')[1]),
    name: mission.name,
    boss: mission.hero_slug || undefined,
    updated_on: new Date().toISOString()
  }));

  return data(
    { existingItems, allMissions, equipment },
    {
      headers: {
        "Cache-Control": "no-store, must-revalidate",
        Pragma: "no-cache",
      },
    }
  );
};

export const action = async ({ params, request }: Route.ActionArgs) => {
  invariant(params.slug, "Missing equipment slug param");

  const formData = await request.formData();
  const data = JSON.parse(formData.get("equipment") as string);

  try {
    const validated = EquipmentMutationSchema.parse(data);

    const updateResults = await EquipmentDataService.update(params.slug, validated);

    if (updateResults instanceof ZodError) {
      return data({ errors: updateResults.format() }, { stats: 400 });
    } else {
      return redirect(`/equipment/${updateResults.slug}`);
    }
  } catch (error) {
    if (error instanceof ZodError) {
      return data({ errors: error.format() }, { status: 400 });
    }
    throw error;
  }
};

export default function EditEquipment({ loaderData }: Route.ComponentProps) {
  const { allMissions, existingItems, equipment } = loaderData;

  const form = useForm<EquipmentMutation>({
    resolver: zodResolver(EquipmentMutationSchema),
    defaultValues: equipment,
  });

  return <EquipmentForm form={form} existingItems={existingItems} missions={allMissions} />;
}
