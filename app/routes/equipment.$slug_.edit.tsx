import { Route } from ".react-router/types/app/routes/+types/equipment.$slug_.edit";
import EquipmentForm from "@/components/EquipmentForm";
import {
    EquipmentMutationSchema,
    type EquipmentMutation,
} from "@/data/equipment.zod";
import { equipmentDAL } from "@/lib/equipment-dal";
import { missionDAL } from "@/lib/mission-dal";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { redirect } from "react-router";
import invariant from "tiny-invariant";
import { ZodError } from "zod";

export const meta = ({ data }: Route.MetaArgs) => {
    return [{ title: `Edit ${data?.equipment.name}` }];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
    invariant(params.slug, "Missing equipment slug param.");
    const equipment = await equipmentDAL.getEquipmentBySlug(params.slug);
    if (!equipment) {
        throw new Response(null, {
            status: 404,
            statusText: `Equipment with slug ${params.slug} not found.`,
        });
    }

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

    return { existingItems, existingStats, allMissions, equipment };
};

export const action = async ({ params, request }: Route.ActionArgs) => {
    invariant(params.slug, "Missing equipment slug param");

    const formData = await request.formData();
    const data = JSON.parse(formData.get("equipment") as string);

    try {
        const validated = EquipmentMutationSchema.parse(data);

        const updatedEquipment = await equipmentDAL.updateEquipment(
            params.slug,
            validated
        );

        return redirect(`/equipment/${updatedEquipment.slug}`);
    } catch (error) {
        if (error instanceof ZodError) {
            return data({ errors: error.format() }, { status: 400 });
        }
        throw error;
    }
};

export default function EditEquipment({ loaderData }: Route.ComponentProps) {
    const { allMissions, existingStats, existingItems, equipment } = loaderData;

    const form = useForm<EquipmentMutation>({
        resolver: zodResolver(EquipmentMutationSchema),
        defaultValues: equipment,
    });

    return (
        <EquipmentForm
            form={form}
            existingStats={existingStats}
            existingItems={existingItems}
            missions={allMissions}
        />
    );
}
