import { Route } from ".react-router/types/app/routes/+types/equipment.$slug.destroy";
import { equipmentDAL } from "@/lib/equipment-dal";
import { redirect } from "react-router";
import invariant from "tiny-invariant";

export const action = async ({ params }: Route.ActionArgs) => {
    invariant(params.slug, "Expected params.equipmentId");

    await equipmentDAL.deleteEquipment(params.slug);

    return redirect("/equipment");
};
