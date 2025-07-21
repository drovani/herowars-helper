import { cva } from "class-variance-authority";
import { Plus } from "lucide-react";
import { Link, Await } from "react-router";
import { Suspense } from "react";
import { RequireEditor } from "~/components/auth/RequireRole";
import { Button } from "~/components/ui/button";
import { Card, CardHeader } from "~/components/ui/card";
import { cn, getEquipmentImageUrl } from "~/lib/utils";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { EquipmentIndexSkeleton } from "~/components/skeletons/EquipmentIndexSkeleton";
import type { Route } from "./+types/index";

async function loadEquipmentData(request: Request) {
  const equipmentRepository = new EquipmentRepository(request);
  const equipmentResult = await equipmentRepository.findAll();

  if (equipmentResult.error) {
    throw new Response("Failed to load equipment", { status: 500 });
  }

  return { equipments: equipmentResult.data };
}

export const loader = async ({ request }: Route.LoaderArgs) => {
  return {
    equipmentData: loadEquipmentData(request),
  };
};

const cardVariants = cva("p-1 bottom-0 absolute w-full text-center", {
  variants: {
    quality: {
      gray: "bg-gray-100/80",
      green: "bg-green-300/80",
      blue: "bg-blue-300/80",
      violet: "bg-purple-300/80",
      orange: "bg-orange-300/80",
      default: "bg-white/80",
    },
  },
  defaultVariants: {
    quality: "default",
  },
});

function EquipmentContent({ equipments }: { equipments: any[] }) {

  return (
    <div className="space-y-6">
      <RequireEditor>
        <div className="flex justify-end">
          <Button asChild>
            <Link to="/equipment/new" viewTransition>
              <Plus className="mr-2 h-4 w-4" />
              Add New Equipment
            </Link>
          </Button>
        </div>
      </RequireEditor>

      {equipments?.length ? (
        <div className="gap-2 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {equipments.map((equipment) => (
            <Link to={`/equipment/${equipment.slug}`} key={equipment.slug} viewTransition>
              <Card
                className="bg-cover h-28 w-28 relative bg-center hover:scale-110 transition-all duration-500"
                style={{
                  backgroundImage: `url('${getEquipmentImageUrl(equipment.slug)}')`,
                }}
              >
                <CardHeader
                  className={cn(
                    cardVariants({
                      quality: equipment.quality,
                    })
                  )}
                >
                  <div className="font-semibold">{equipment.name}</div>
                </CardHeader>
              </Card>
            </Link>
          ))}
        </div>
      ) : (
        <p>No equipment found.</p>
      )}
    </div>
  );
}

export default function EquipmentIndex({ loaderData }: Route.ComponentProps) {
  return (
    <Suspense fallback={<EquipmentIndexSkeleton />}>
      <Await resolve={loaderData?.equipmentData}>
        {(data: { equipments: any[] | null }) => (
          <EquipmentContent equipments={data.equipments || []} />
        )}
      </Await>
    </Suspense>
  );
}
