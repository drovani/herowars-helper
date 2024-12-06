import { Route } from ".react-router/types/app/routes/+types/equipment.new";
import EquipmentForm from "@/components/EquipmentForm";
import {
    EquipmentMutation,
    EquipmentMutationSchema,
} from "@/data/equipment.zod";
import { equipmentDAL } from "@/lib/equipment-dal";
import { missionDAL } from "@/lib/mission-dal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { redirect } from "react-router";
import { ZodError } from "zod";

export const meta = (_: Route.MetaArgs) => {
    return [{ title: "Create new equipment" }];
};

export const loader = async (_: Route.LoaderArgs) => {
    const [allMissions, existingItems] = await Promise.all([
        missionDAL.getAllMissions(),
        equipmentDAL.getAllEquipment(),
    ]);

    const existingStats = [
        ...new Set(
            existingItems.flatMap((ae) =>
                "stats" in ae ? Object.keys(ae.stats || {}) : []
            )
        ),
    ];

    return { existingItems, existingStats, allMissions };
};

export const action = async ({ request }: Route.ActionArgs) => {
    const formData = await request.formData();
    const data = JSON.parse(formData.get("equipment") as string);

    console.debug(data);

    try {
        const validated = EquipmentMutationSchema.parse(data);

        const newEquipment = await equipmentDAL.createEquipment(validated);

        return redirect(`/equipment/${newEquipment.slug}`);
    } catch (error) {
        if (error instanceof ZodError) {
            return data({ errors: error.format() }, { status: 400 });
        }
        throw error;
    }
};

export default function NewEquipment({ loaderData }: Route.ComponentProps) {
    const { allMissions, existingStats, existingItems } = loaderData;
    const form = useForm<EquipmentMutation>({
        resolver: zodResolver(EquipmentMutationSchema),
        defaultValues: {
            quality: "gray",
            hero_level_required: 1,
            buy_value: 0,
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
                existingStats={existingStats}
                existingItems={existingItems}
            />
        </section>
    );
}
