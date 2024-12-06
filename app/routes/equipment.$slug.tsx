import { Route } from ".react-router/types/app/routes/+types/equipment.$slug";
import EquipmentImage from "@/components/EquipmentImage";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from "@/components/ui/card";
import type { EquipmentRecord } from "@/data/equipment.zod";
import type { Mission } from "@/data/mission.zod";
import { equipmentDAL } from "@/lib/equipment-dal";
import { missionDAL } from "@/lib/mission-dal";
import { AlertCircle, ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect } from "react";
import { Form, Link, useNavigate } from "react-router";
import invariant from "tiny-invariant";

export const meta = ({ data }: Route.MetaArgs) => {
    return [{ title: data?.equipment.name }];
};

export const loader = async ({ params }: Route.LoaderArgs) => {
    invariant(params.slug, "Missing equipment slug param");

    // Get main equipment details
    const equipment = await equipmentDAL.getEquipmentBySlug(params.slug);

    if (!equipment) {
        throw new Response(null, {
            status: 404,
            statusText: `Equipment with id ${params.equipmentId} not found.`,
        });
    }

    const sortedEquipment = await equipmentDAL.getAllEquipment();
    const currentIndex = sortedEquipment.findIndex(
        (e) => e.slug === equipment.slug
    );
    const prevEquipment =
        currentIndex > 0 ? sortedEquipment[currentIndex - 1] : null;
    const nextEquipment =
        currentIndex < sortedEquipment.length
            ? sortedEquipment[currentIndex + 1]
            : null;

    // Get equipment that requires this item
    const requiredFor = await equipmentDAL.getEquipmentThatRequires(
        equipment.slug
    );

    const requiredEquipment =
        "crafting" in equipment && equipment.crafting
            ? await equipmentDAL.getAllEquipment(
                  Object.keys(equipment.crafting.required_items)
              )
            : [];

    // Get all missions and filter for sources
    const allMissions = await missionDAL.getAllMissions();
    const missionSources = equipment.campaign_sources
        ? equipment.campaign_sources
              .map((source) => allMissions.find((m) => m.id === source))
              .filter((m): m is Mission => m !== undefined)
              .sort((a, b) => {
                  const [aChapter, aMission] = a.id.split("-").map(Number);
                  const [bChapter, bMission] = b.id.split("-").map(Number);
                  return aChapter === bChapter
                      ? aMission - bMission
                      : aChapter - bChapter;
              })
        : [];

    return {
        equipment,
        requiredEquipment,
        requiredFor,
        missionSources,
        prevEquipment,
        nextEquipment,
    };
};

// Component to render either a valid equipment item or a placeholder
const EquipmentItem = ({
    item,
    quantity,
}: {
    item: EquipmentRecord | null;
    quantity: number;
}) => {
    if (!item) {
        return (
            <div className="flex flex-col items-center gap-2">
                <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
                    <AlertCircle className="text-muted-foreground" />
                </div>
                <div className="text-center">
                    <div className="text-muted-foreground">Missing Item</div>
                    <div className="text-sm text-muted-foreground">
                        {quantity}x required
                    </div>
                </div>
            </div>
        );
    }

    return (
        <Link
            to={`/equipment/${item.slug}`}
            className="flex flex-col items-center gap-2 group"
        >
            <EquipmentImage equipment={item} size="md" />
            <div className="text-center">
                <div className="group-hover:underline">{item.name}</div>
                <div className="text-sm text-muted-foreground">
                    {quantity}x required
                </div>
            </div>
        </Link>
    );
};

export default function Equipment({ loaderData }: Route.ComponentProps) {
    const {
        equipment,
        requiredEquipment,
        requiredFor,
        missionSources,
        prevEquipment,
        nextEquipment,
    } = loaderData;
    const navigate = useNavigate();

    useEffect(() => {
        function handleKeyDown(event: KeyboardEvent) {
            // Skip if user is typing in an input or textarea
            if (
                event.target instanceof HTMLInputElement ||
                event.target instanceof HTMLTextAreaElement
            ) {
                return;
            }

            switch (event.key) {
                case "ArrowLeft":
                    if (prevEquipment) {
                        navigate(`/equipment/${prevEquipment.slug}`);
                    }
                    break;
                case "ArrowRight":
                    if (nextEquipment) {
                        navigate(`/equipment/${nextEquipment.slug}`);
                    }
                    break;
            }
        }

        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [navigate, prevEquipment, nextEquipment]);

    return (
        <div className="space-y-8">
            {/* Header Section */}
            <div className="flex items-start gap-6">
                <EquipmentImage equipment={equipment} size="lg" />
                <div className="space-y-4">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">
                            {equipment.name}
                        </h1>
                        {"hero_level_required" in equipment && (
                            <p className="text-muted-foreground">
                                Required Level: {equipment.hero_level_required}
                            </p>
                        )}
                    </div>

                    <div className="flex gap-4">
                        <div className="text-sm space-y-2">
                            <div>Buy Value:</div>
                            <div className="flex items-center gap-2">
                                <img
                                    src="/images/gold.webp"
                                    alt="Gold"
                                    className="w-6 h-6"
                                />
                                <span>
                                    {equipment.buy_value.toLocaleString()}
                                </span>
                            </div>
                        </div>
                        <div className="text-sm space-y-2">
                            <div>Sell Value:</div>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <img
                                        src="/images/gold.webp"
                                        alt="Gold"
                                        className="w-6 h-6"
                                    />
                                    <span>
                                        {equipment.sell_value.toLocaleString()}
                                    </span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <img
                                        src="/images/guild_activity_points.webp"
                                        alt="Guild Activity Points"
                                        className="w-6 h-6"
                                    />
                                    <span>
                                        {equipment.guild_activity_points}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Section */}
            {"stats" in equipment &&
                equipment.stats &&
                Object.entries(equipment.stats).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Stats</CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                            {Object.entries(equipment.stats).map(
                                ([stat, value]) => (
                                    <div
                                        key={stat}
                                        className="flex items-center gap-2"
                                    >
                                        <span className="capitalize">
                                            {stat}:
                                        </span>
                                        <span className="font-semibold">
                                            {value}
                                        </span>
                                    </div>
                                )
                            )}
                        </CardContent>
                    </Card>
                )}

            {/* Campaign Sources Section */}
            {missionSources.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Found in Campaign</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-2">
                            {missionSources.map((mission) => (
                                <Link
                                    key={mission.id}
                                    to={`/missions/${mission.id}`}
                                    className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                                >
                                    <Badge variant="outline">
                                        {mission.chapter}-
                                        {mission.mission_number}
                                    </Badge>
                                    <span>{mission.name}</span>
                                    {mission.boss && (
                                        <Badge
                                            variant="secondary"
                                            className="ml-auto"
                                        >
                                            {mission.boss}
                                        </Badge>
                                    )}
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Crafting Requirements Section */}
            {requiredEquipment.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Crafting Requirements</CardTitle>
                        {"crafting" in equipment &&
                            equipment.crafting?.gold_cost && (
                                <CardDescription className="flex items-center gap-1">
                                    <img
                                        src="/images/gold.webp"
                                        alt="Gold cost"
                                        className="w-6 h-6"
                                    />
                                    {equipment.crafting.gold_cost.toLocaleString()}{" "}
                                    gold
                                </CardDescription>
                            )}
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-wrap items-center gap-4">
                            {requiredEquipment.map((item, index) => (
                                <EquipmentItem
                                    key={item?.slug || `missing-${index}`}
                                    item={item}
                                    quantity={
                                        "crafting" in equipment
                                            ? equipment.crafting
                                                  ?.required_items[
                                                  item?.slug || ""
                                              ] || 0
                                            : 0
                                    }
                                />
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Required For Section */}
            {requiredFor.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Required For</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                            {requiredFor.map((item) => (
                                <Link
                                    key={item.slug}
                                    to={`/equipment/${item.slug}`}
                                    className="flex items-center gap-2 group"
                                >
                                    <EquipmentImage
                                        equipment={item}
                                        size="sm"
                                    />
                                    <div>
                                        <div className="group-hover:underline">
                                            {item.name}
                                        </div>
                                        <div className="text-sm text-muted-foreground">
                                            Requires{" "}
                                            {"crafting" in item
                                                ? item.crafting?.required_items[
                                                      equipment.slug
                                                  ]
                                                : 0}
                                            x
                                        </div>
                                    </div>
                                </Link>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
                <Link
                    to={`/equipment/${equipment.slug}/edit`}
                    className={buttonVariants({ variant: "default" })}
                >
                    Edit
                </Link>
                <Form
                    action="destroy"
                    method="post"
                    onSubmit={(event) => {
                        const response = confirm(
                            `Please confirm you want to delete ${equipment.name}.`
                        );
                        if (!response) {
                            event.preventDefault();
                        }
                    }}
                >
                    <Button type="submit" variant="destructive">
                        Delete
                    </Button>
                </Form>
            </div>
            {/* Navigation Buttons */}
            <div className="flex justify-between items-center gap-4 flex-1 order-1 sm:order-2">
                {prevEquipment ? (
                    <Link
                        to={`/equipment/${prevEquipment.slug}`}
                        className={buttonVariants({ variant: "outline" })}
                    >
                        <ArrowLeftIcon className="mr-2 h-4 w-4" />
                        {prevEquipment.name}
                    </Link>
                ) : (
                    <div />
                )}

                <Link
                    to="/equipment"
                    className={buttonVariants({ variant: "secondary" })}
                >
                    All Equipment
                </Link>

                {nextEquipment ? (
                    <Link
                        to={`/equipment/${nextEquipment.slug}`}
                        className={buttonVariants({ variant: "outline" })}
                    >
                        {nextEquipment.name}
                        <ArrowRightIcon className="ml-2 h-4 w-4" />
                    </Link>
                ) : (
                    <div />
                )}
            </div>
        </div>
    );
}
