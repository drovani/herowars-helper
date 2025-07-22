import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { redirect, type UIMatch, data } from "react-router";
import { ZodError } from "zod";
import EquipmentForm from "~/components/EquipmentForm";
import {
  type EquipmentMutation,
  EquipmentMutationSchema,
} from "~/data/equipment.zod";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { MissionRepository } from "~/repositories/MissionRepository";
import type { Route } from "./+types/new";

export const meta = (_: Route.MetaArgs) => {
  return [{ title: "Create new equipment" }];
};

export const handle = {
  breadcrumb: (
    matches: UIMatch<Route.ComponentProps["loaderData"], unknown>
  ) => ({
    href: matches.pathname,
    title: "New",
  }),
};

export const loader = async ({ request }: Route.LoaderArgs) => {
  const missionRepo = new MissionRepository(request);
  const equipmentRepo = new EquipmentRepository(request);
  const [missionsResult, existingItemsResult] = await Promise.all([
    missionRepo.findAll({ orderBy: { column: "slug", ascending: true } }),
    equipmentRepo.getAllAsJson(),
  ]);

  if (missionsResult.error) {
    throw new Response("Failed to load missions", { status: 500 });
  }

  if (existingItemsResult.error) {
    throw new Response("Failed to load existing equipment", { status: 500 });
  }

  const missions = missionsResult.data || [];
  const existingItems = existingItemsResult.data || [];

  // Convert Mission[] to MissionRecord[] for compatibility with existing components
  const allMissions = missions.map((mission) => ({
    id: mission.slug,
    chapter: mission.chapter_id,
    chapter_title: "", // We'd need to fetch this from chapters table
    mission_number: parseInt(mission.slug.split("-")[1]),
    name: mission.name,
    boss: mission.hero_slug || undefined,
    updated_on: new Date().toISOString(),
  }));

  return { existingItems, allMissions };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const data = JSON.parse(formData.get("equipment") as string);

  try {
    const validated = EquipmentMutationSchema.parse(data);

    const equipmentRepo = new EquipmentRepository(request);
    const createResult = await equipmentRepo.create(validated);

    if (createResult.error) {
      return data(
        { errors: { _errors: [createResult.error.message] } },
        { status: 400 }
      );
    }

    return redirect(`/equipment/${createResult.data!.slug}`);
  } catch (error) {
    if (error instanceof ZodError) {
      return data({ errors: error.format() }, { status: 400 });
    }
    throw error;
  }
};

export default function NewEquipment({ loaderData }: Route.ComponentProps) {
  const { allMissions, existingItems } = loaderData;
  const form = useForm<EquipmentMutation>({
    resolver: zodResolver(EquipmentMutationSchema),
    defaultValues: {
      quality: "gray",
      hero_level_required: 1,
      buy_value_gold: 0,
      buy_value_coin: 0,
      sell_value: 0,
      guild_activity_points: 0,
    },
  });
  return (
    <section className="space-y-4">
      <h1>New Equipment</h1>
      <EquipmentForm
        form={form}
        missions={allMissions}
        existingItems={existingItems}
      />
    </section>
  );
}
