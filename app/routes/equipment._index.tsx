import { cva } from "class-variance-authority";
import { Link } from "react-router";
import { Card, CardHeader } from "~/components/ui/card";
import { cn, parseSlugGetImageUrl } from "~/lib/utils";
import EquipmentRepository from "~/services/EquipmentRepository";
import type { Route } from "./+types/equipment._index";

export const loader = async (_: Route.LoaderArgs) => {
  const equipments = await EquipmentRepository.getAll();

  return { equipments };
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

export default function EquipmentIndex({ loaderData }: Route.ComponentProps) {
  const { equipments } = loaderData;

  return (
    <div>
      {equipments.length ? (
        <div className="gap-2 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {equipments.map((equipment) => (
            <Link to={`/equipment/${equipment.slug}`} key={equipment.slug} viewTransition>
              <Card
                className="bg-cover h-28 w-28 relative bg-center hover:scale-110 transition-all duration-500"
                style={{
                  backgroundImage: `url('${parseSlugGetImageUrl(equipment.slug)}')`,
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
