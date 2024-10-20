import { Link, useLoaderData } from "@remix-run/react";
import { cva } from "class-variance-authority";
import { Card, CardHeader, CardTitle } from "~/components/ui/card";
import { cn } from "~/lib/utils";
import { getAllEquipment } from "../data";

export const loader = async () => {
    const equipments = await getAllEquipment();
    return { equipments };
};

const cardVariants = cva("p-1 bottom-0 absolute w-full text-center", {
    variants: {
        quality: {
            gray: "bg-gray-100/80",
            green: "bg-green-300/80",
            blue: "bg-blue-300/80",
            purple: "bg-purple-300/80",
            orange: "bg-orange-300/80",
            default: "bg-white/80",
        },
    },
    defaultVariants: {
        quality: "default",
    },
});

export default function EquipmentIndex() {
    const { equipments } = useLoaderData<typeof loader>();

    return (
        <div>
            {equipments.length ? (
                <div className="gap-2 grid grid-cols-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
                    {equipments.map((equipment) => (
                        <Link
                            to={`/equipment/${equipment.slug}`}
                            key={equipment.slug}
                        >
                            <Card
                                className="bg-cover h-28 w-28 relative bg-center hover:scale-110 transition-all duration-500"
                                style={{
                                    backgroundImage: `url('/images/equipment/${equipment.slug}.png')`,
                                }}
                            >
                                <CardHeader
                                    className={cn(
                                        cardVariants({
                                            quality:
                                                equipment.equipment_quality,
                                        })
                                    )}
                                >
                                    <CardTitle className="text-base">
                                        {equipment.name}
                                    </CardTitle>
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
