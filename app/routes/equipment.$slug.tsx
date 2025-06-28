import { AlertCircle, ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, type UIMatch } from "react-router";
import invariant from "tiny-invariant";
import EquipmentImage from "~/components/EquipmentImage";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { EquipmentRecord } from "~/data/equipment.zod";
import { generateSlug } from "~/lib/utils";
import EquipmentDataService from "~/services/EquipmentDataService";
import HeroDataService from "~/services/HeroDataService";
import MissionDataService from "~/services/MissionDataService";
import type { Route } from "./+types/equipment.$slug";

export const meta = ({ data }: Route.MetaArgs) => {
  return [{ title: data?.equipment.name }];
};

export const handle = {
  breadcrumb: (match: UIMatch<Route.ComponentProps["loaderData"], unknown>) => ({
    href: match.pathname,
    title: match.data?.equipment.name,
  }),
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  invariant(params.slug, "Missing equipment slug param");

  // Get main equipment details
  const equipment = await EquipmentDataService.getById(params.slug);

  if (!equipment) {
    throw new Response(null, {
      status: 404,
      statusText: `Equipment with id ${params.slug} not found.`,
    });
  }

  const sortedEquipment = await EquipmentDataService.getAll();
  const currentIndex = sortedEquipment.findIndex((e) => e.slug === equipment.slug);
  const prevEquipment = currentIndex > 0 ? sortedEquipment[currentIndex - 1] : null;
  const nextEquipment = currentIndex < sortedEquipment.length ? sortedEquipment[currentIndex + 1] : null;

  const requiredFor = await EquipmentDataService.getEquipmentThatRequires(equipment.slug);
  const requiredEquipment = await EquipmentDataService.getEquipmentRequiredFor(equipment);
  let requiredEquipmentRaw = await EquipmentDataService.getEquipmentRequiredForRaw(equipment);

  if ("crafting" in equipment && equipment.crafting?.gold_cost === requiredEquipmentRaw?.gold_cost) {
    requiredEquipmentRaw = null;
  }

  // Get all missions and filter for sources
  const missionSources = equipment.campaign_sources ? await MissionDataService.getAll(equipment.campaign_sources) : [];

  const heroesUsingItem = await HeroDataService.getHeroesUsingItem(equipment.slug);

  return {
    equipment,
    requiredEquipment,
    requiredEquipmentRaw,
    requiredFor,
    missionSources,
    prevEquipment,
    nextEquipment,
    heroesUsingItem,
  };
};

// Component to render either a valid equipment item or a placeholder
const EquipmentItem = ({ item, quantity }: { item: EquipmentRecord | null; quantity: number }) => {
  if (!item) {
    return (
      <div className="flex flex-col items-center gap-2">
        <div className="w-16 h-16 bg-muted rounded-lg flex items-center justify-center">
          <AlertCircle className="text-muted-foreground" />
        </div>
        <div className="text-center">
          <div className="text-muted-foreground">Missing Item</div>
          <div className="text-sm text-muted-foreground">{quantity}x required</div>
        </div>
      </div>
    );
  }

  return (
    <Link to={`/equipment/${item.slug}`} className="flex flex-col items-center gap-2 group" viewTransition>
      <EquipmentImage equipment={item} size="md" />
      <div className="text-center">
        <div className="group-hover:underline">{item.name}</div>
        <div className="text-sm text-muted-foreground">{quantity}x required</div>
      </div>
    </Link>
  );
};

export default function Equipment({ loaderData }: Route.ComponentProps) {
  const {
    equipment,
    requiredEquipment,
    requiredEquipmentRaw,
    requiredFor,
    missionSources,
    prevEquipment,
    nextEquipment,
    heroesUsingItem,
  } = loaderData;
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      // Skip if user is typing in an input or textarea
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
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
            <h1 className="text-3xl font-bold mb-2">{equipment.name}</h1>
            {"hero_level_required" in equipment && (
              <p className="text-muted-foreground">Required Level: {equipment.hero_level_required}</p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="text-sm space-y-2">
              <div>Buy Value:</div>
              <div className={`flex items-center gap-2 ${equipment.buy_value_gold === 0 && "opacity-40"}`}>
                <img src="/images/gold.webp" alt="Gold" className="w-6 h-6" />
                <span>{equipment.buy_value_gold.toLocaleString()}</span>
              </div>
              <div className={`flex items-center gap-2 ${equipment.buy_value_coin === 0 && "opacity-40"}`}>
                <img src="/images/arena-coin.png" alt="Arena Coin" className="w-6 h-6 rounded-full" />
                <span>{equipment.buy_value_coin.toLocaleString()}</span>
              </div>
            </div>
            <div className="text-sm space-y-2">
              <div>Sell Value:</div>
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <img src="/images/gold.webp" alt="Gold" className="w-6 h-6" />
                  <span>{equipment.sell_value.toLocaleString()}</span>
                </div>
                <div className="flex items-center gap-2">
                  <img src="/images/guild_activity_points.webp" alt="Guild Activity Points" className="w-6 h-6" />
                  <span>{equipment.guild_activity_points}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {/* Stats Section */}
      {"stats" in equipment && equipment.stats && Object.entries(equipment.stats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Stats</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col md:flex-row md:flex-wrap gap-4">
            {Object.entries(equipment.stats).map(([stat, value]) => (
              <div key={stat} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <img src={`/images/stats/${generateSlug(stat)}.png`} alt={stat} className="w-6 h-6" />
                  <span className="capitalize">{stat}:</span>
                </div>
                <span className="font-semibold">{value}</span>
              </div>
            ))}
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
            <div className="flex gap-2 flex-wrap">
              {missionSources.map((mission) => (
                <Link
                  key={mission.id}
                  to={`/missions/${mission.id}`}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                  viewTransition
                >
                  <Badge variant="outline">
                    {mission.chapter}-{mission.mission_number}
                  </Badge>
                  <span>{mission.name}</span>
                  {mission.boss && (
                    <Badge variant="secondary" className="ml-auto">
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
            {"crafting" in equipment && equipment.crafting?.gold_cost && (
              <CardDescription className="flex items-center gap-1">
                <img src="/images/gold.webp" alt="Gold cost" className="w-6 h-6" />
                {equipment.crafting.gold_cost.toLocaleString()} gold
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              {requiredEquipment.map((item, index) => (
                <EquipmentItem
                  key={item?.slug || `missing-${index}`}
                  item={item}
                  quantity={"crafting" in equipment ? equipment.crafting?.required_items[item?.slug || ""] || 0 : 0}
                />
              ))}
            </div>
            {requiredEquipmentRaw && (
              <>
                <Separator className="my-2" decorative={true} />
                <div>
                  <h4>Raw Components:</h4>
                  <div className="flex items-center">
                    <img src="/images/gold.webp" alt="Gold cost" className="w-6 h-6" />
                    <span>{requiredEquipmentRaw.gold_cost.toLocaleString()} gold</span>
                  </div>
                  <div className="inline-grid gap-x-2 gap-y-1" style={{ gridTemplateColumns: "min-content auto" }}>
                    {requiredEquipmentRaw.required_items.map((item) => {
                      return [
                        <span>{item.quantity}x</span>,
                        <Link to={`/equipment/${item.equipment.slug}`} className="flex items-center gap-1 group">
                          <EquipmentImage equipment={item.equipment} size={"xs"} />
                          <span className="group-hover:underline">{item.equipment.name}</span>
                        </Link>,
                      ];
                    })}
                  </div>
                </div>
              </>
            )}
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
            <div className="flex gap-4 flex-wrap">
              {requiredFor.map((item) => (
                <Link
                  key={item.slug}
                  to={`/equipment/${item.slug}`}
                  className="flex items-center gap-2 group"
                  viewTransition
                >
                  <EquipmentImage equipment={item} size="sm" />
                  <div>
                    <div className="group-hover:underline whitespace-nowrap">{item.name}</div>
                    <div className="text-sm text-muted-foreground whitespace-nowrap">
                      Requires {"crafting" in item ? item.crafting?.required_items[equipment.slug] : 0}x
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
      {heroesUsingItem.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Heroes Using Item</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {heroesUsingItem.map((hero) => (
              <Link to={`/heroes/${hero.slug}`} key={hero.slug} className="group flex items-center gap-2">
                <img src={`/images/heroes/${hero.slug}.png`} alt={hero.name[0]} className="size-8" />
                <span className="group-hover:underline">{hero.name}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link
          to={`/equipment/${equipment.slug}/edit`}
          className={buttonVariants({ variant: "default" })}
          viewTransition
        >
          Edit
        </Link>
      </div>
      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 w-full">
        <div className="flex justify-start w-full sm:w-auto">
          {prevEquipment ? (
            <Link
              to={`/equipment/${prevEquipment.slug}`}
              className={buttonVariants({ variant: "outline" })}
              viewTransition
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {prevEquipment.name}
            </Link>
          ) : (
            <div />
          )}
        </div>
        <div className="flex justify-center w-full sm:w-auto">
          <Link to="/equipment" className={buttonVariants({ variant: "secondary" })} viewTransition>
            All Equipment
          </Link>
        </div>
        <div className="flex justify-end w-full sm:w-auto">
          {nextEquipment ? (
            <Link
              to={`/equipment/${nextEquipment.slug}`}
              className={buttonVariants({ variant: "outline" })}
              viewTransition
            >
              {nextEquipment.name}
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Link>
          ) : (
            <div />
          )}
        </div>
      </div>
    </div>
  );
}
