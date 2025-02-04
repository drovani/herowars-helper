import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { redirect, type UIMatch } from "react-router";
import { ZodError } from "zod";
import EquipmentForm from "~/components/EquipmentForm";
import { type EquipmentMutation, EquipmentMutationSchema } from "~/data/equipment.zod";
import EquipmentDataService from "~/services/EquipmentDataService";
import MissionRepository from "~/services/MissionRepository";
import type { Route } from "./+types/equipment.new";

export const meta = (_: Route.MetaArgs) => {
  return [{ title: "Create new equipment" }];
};

export const handle = {
  breadcrumb: (matches: UIMatch<Route.ComponentProps["loaderData"], unknown>) => ({
    href: matches.pathname,
    title: "New",
  }),
};

export const loader = async (_: Route.LoaderArgs) => {
  const [allMissions, existingItems] = await Promise.all([MissionRepository.getAll(), EquipmentDataService.getAll()]);

  return { existingItems, allMissions };
};

export const action = async ({ request }: Route.ActionArgs) => {
  const formData = await request.formData();
  const data = JSON.parse(formData.get("equipment") as string);

  try {
    const validated = EquipmentMutationSchema.parse(data);

    const createResult = await EquipmentDataService.create(validated);

    if (createResult instanceof ZodError) {
      return data({ errors: createResult.format() }, { status: 400 });
    }
    return redirect(`/equipment/${createResult.slug}`);

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
      <EquipmentForm form={form} missions={allMissions} existingItems={existingItems} />
    </section>
  );
}
