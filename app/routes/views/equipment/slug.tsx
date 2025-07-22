import { AlertCircle, ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, type UIMatch } from "react-router";
import invariant from "tiny-invariant";
import { RequireEditor } from "~/components/auth/RequireRole";
import EquipmentImage from "~/components/EquipmentImage";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "~/components/ui/card";
import { Separator } from "~/components/ui/separator";
import type { EquipmentRecord } from "~/data/equipment.zod";
import { generateSlug } from "~/lib/utils";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { HeroRepository } from "~/repositories/HeroRepository";
import { MissionRepository } from "~/repositories/MissionRepository";
import {
  transformCompleteHeroToRecord,
  transformBasicHeroToRecord,
} from "~/lib/hero-transformations";
import type { Route } from "./+types/slug";

export const meta = ({ data }: Route.MetaArgs) => {
  return [{ title: data?.equipment.name }];
};

export const handle = {
  breadcrumb: (
    match: UIMatch<Route.ComponentProps["loaderData"], unknown>
  ) => ({
    href: match.pathname,
    title: match.data?.equipment.name,
  }),
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.slug, "Missing equipment slug param");

  const equipmentRepo = new EquipmentRepository(request);

  // Get main equipment details in both formats
  const [equipmentJsonResult, equipmentDbResult] = await Promise.all([
    equipmentRepo.getAllAsJson([params.slug]),
    equipmentRepo.findById(params.slug),
  ]);

  if (
    equipmentJsonResult.error ||
    !equipmentJsonResult.data ||
    equipmentJsonResult.data.length === 0
  ) {
    throw new Response(null, {
      status: 404,
      statusText: `Equipment with id ${params.slug} not found.`,
    });
  }

  if (equipmentDbResult.error || !equipmentDbResult.data) {
    throw new Response(null, {
      status: 404,
      statusText: `Equipment with id ${params.slug} not found.`,
    });
  }

  const equipment = equipmentJsonResult.data[0];
  const equipmentDb = equipmentDbResult.data;

  // Get all equipment for navigation
  const sortedEquipmentResult = await equipmentRepo.getAllAsJson();
  if (sortedEquipmentResult.error) {
    throw new Response("Failed to load equipment list", { status: 500 });
  }

  const sortedEquipment = sortedEquipmentResult.data || [];
  const currentIndex = sortedEquipment.findIndex(
    (e) => e.slug === equipment.slug
  );
  const prevEquipment =
    currentIndex > 0 ? sortedEquipment[currentIndex - 1] : null;
  const nextEquipment =
    currentIndex < sortedEquipment.length
      ? sortedEquipment[currentIndex + 1]
      : null;

  // Get equipment relationships
  const [
    requiredForResult,
    requiredEquipmentResult,
    requiredEquipmentRawResult,
    rawComponentOfResult,
  ] = await Promise.all([
    equipmentRepo.findEquipmentThatRequires(equipment.slug),
    equipmentRepo.findEquipmentRequiredFor(equipmentDb),
    equipmentRepo.findEquipmentRequiredForRaw(equipmentDb),
    equipmentRepo.findRawComponentOf(equipment.slug),
  ]);

  const requiredFor = requiredForResult.data || [];
  const requiredEquipment = requiredEquipmentResult.data || [];
  let requiredEquipmentRaw = requiredEquipmentRawResult.data;
  const rawComponentOf = rawComponentOfResult.data || [];

  // Hide raw materials if they're the same as direct crafting cost
  if (equipment.crafting_gold_cost === requiredEquipmentRaw?.gold_cost) {
    requiredEquipmentRaw = null;
  }

  // Get mission sources using the new repository
  const missionRepo = new MissionRepository(request);
  const missionSourcesResult = await missionRepo.findByCampaignSource(
    equipment.slug
  );

  if (missionSourcesResult.error) {
    throw new Response("Failed to load mission sources", { status: 500 });
  }

  const missionSources = missionSourcesResult.data || [];

  const heroRepo = new HeroRepository(request);
  const heroesUsingItemResult = await heroRepo.findHeroesUsingEquipment(
    equipment.slug
  );

  if (heroesUsingItemResult.error) {
    throw new Response("Failed to load heroes using item", { status: 500 });
  }

  // Transform heroes to HeroRecord format
  const heroesUsingItem = heroesUsingItemResult.data
    ? await Promise.all(
        heroesUsingItemResult.data.map(async (hero) => {
          const completeHeroResult = await heroRepo.findWithAllData(hero.slug);
          if (completeHeroResult.data) {
            return transformCompleteHeroToRecord(completeHeroResult.data);
          }
          return transformBasicHeroToRecord(hero);
        })
      )
    : [];

  return {
    equipment,
    requiredEquipment,
    requiredEquipmentRaw,
    requiredFor,
    rawComponentOf,
    missionSources,
    prevEquipment,
    nextEquipment,
    heroesUsingItem,
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
      viewTransition
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
    requiredEquipmentRaw,
    requiredFor,
    rawComponentOf,
    missionSources,
    prevEquipment,
    nextEquipment,
    heroesUsingItem,
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
            <h1 className="text-3xl font-bold mb-2">{equipment.name}</h1>
            {"hero_level_required" in equipment && (
              <p className="text-muted-foreground">
                Required Level: {equipment.hero_level_required}
              </p>
            )}
          </div>

          <div className="flex gap-4">
            <div className="text-sm space-y-2">
              <div>Buy Value:</div>
              <div
                className={`flex items-center gap-2 ${
                  equipment.buy_value_gold === 0 && "opacity-40"
                }`}
              >
                <img src="/images/gold.webp" alt="Gold" className="w-6 h-6" />
                <span>{(equipment.buy_value_gold ?? 0).toLocaleString()}</span>
              </div>
              <div
                className={`flex items-center gap-2 ${
                  equipment.buy_value_coin === 0 && "opacity-40"
                }`}
              >
                <img
                  src="/images/arena-coin.png"
                  alt="Arena Coin"
                  className="w-6 h-6 rounded-full"
                />
                <span>{(equipment.buy_value_coin ?? 0).toLocaleString()}</span>
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
                  <img
                    src="/images/guild_activity_points.webp"
                    alt="Guild Activity Points"
                    className="w-6 h-6"
                  />
                  <span>{equipment.guild_activity_points}</span>
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
            <CardContent className="flex flex-col md:flex-row md:flex-wrap gap-4">
              {Object.entries(equipment.stats).map(([stat, value]) => (
                <div key={stat} className="flex items-center gap-2">
                  <div className="flex items-center gap-2">
                    <img
                      src={`/images/stats/${generateSlug(stat)}.png`}
                      alt={stat}
                      className="w-6 h-6"
                    />
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
                  key={mission.slug}
                  to={`/missions/${mission.slug}`}
                  className="flex items-center gap-2 p-2 rounded-md hover:bg-accent"
                  viewTransition
                >
                  <Badge variant="outline">{mission.slug}</Badge>
                  <span>{mission.name}</span>
                  {mission.hero_slug && (
                    <Badge variant="secondary" className="ml-auto capitalize">
                      {mission.hero_slug}
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
            {equipment.crafting_gold_cost && (
              <CardDescription className="flex items-center gap-1">
                <img
                  src="/images/gold.webp"
                  alt="Gold cost"
                  className="w-6 h-6"
                />
                {equipment.crafting_gold_cost.toLocaleString()} gold
              </CardDescription>
            )}
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap items-center gap-4">
              {requiredEquipment.map((requiredItem, index) => (
                <EquipmentItem
                  key={requiredItem?.equipment?.slug || `missing-${index}`}
                  item={requiredItem?.equipment as EquipmentRecord}
                  quantity={requiredItem?.quantity || 0}
                />
              ))}
            </div>
            {requiredEquipmentRaw && (
              <>
                <Separator className="my-2" decorative={true} />
                <div>
                  <h4>Raw Components:</h4>
                  <div className="flex items-center">
                    <img
                      src="/images/gold.webp"
                      alt="Gold cost"
                      className="w-6 h-6"
                    />
                    <span>
                      {requiredEquipmentRaw.gold_cost.toLocaleString()} gold
                    </span>
                  </div>
                  <div className="inline-grid gap-x-2 gap-y-1 grid-cols-[min-content_auto]">
                    {requiredEquipmentRaw.required_items.map((item) => {
                      return [
                        <span>{item.quantity}x</span>,
                        <Link
                          to={`/equipment/${item.equipment.slug}`}
                          className="flex items-center gap-1 group"
                        >
                          <EquipmentImage
                            equipment={item.equipment}
                            size={"xs"}
                          />
                          <span className="group-hover:underline">
                            {item.equipment.name}
                          </span>
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
      {(requiredFor.length > 0 || rawComponentOf.length > 0) && (
        <Card>
          <CardHeader>
            <CardTitle>Required For</CardTitle>
          </CardHeader>
          <CardContent>
            {requiredFor.length > 0 && (
              <div className="flex gap-4 flex-wrap">
                {requiredFor.map((item) => (
                  <Link
                    key={item.equipment.slug}
                    to={`/equipment/${item.equipment.slug}`}
                    className="flex items-center gap-2 group"
                    viewTransition
                  >
                    <EquipmentImage equipment={item.equipment} size="sm" />
                    <div>
                      <div className="group-hover:underline whitespace-nowrap">
                        {item.equipment.name}
                      </div>
                      <div className="text-sm text-muted-foreground whitespace-nowrap">
                        Requires {item.quantity}x
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
            {rawComponentOf.length > 0 && (
              <>
                <Separator className="my-2" decorative={true} />
                <div>
                  <h4>Final Products:</h4>
                  <div className="inline-grid gap-x-2 gap-y-1 grid-cols-[min-content_1fr]">
                    {rawComponentOf.map((item) => {
                      return [
                        <span
                          key={`qty-${item.equipment.slug}`}
                          className="whitespace-nowrap"
                        >
                          {item.totalQuantity}x for
                        </span>,
                        <Link
                          key={`link-${item.equipment.slug}`}
                          to={`/equipment/${item.equipment.slug}`}
                          className="flex items-center gap-1 group whitespace-nowrap"
                          viewTransition
                        >
                          <EquipmentImage
                            equipment={item.equipment}
                            size={"xs"}
                          />
                          <span className="group-hover:underline">
                            {item.equipment.name}
                          </span>
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

      {heroesUsingItem.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Heroes Using Item</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-wrap gap-2">
            {heroesUsingItem.map((hero) => (
              <Link
                to={`/heroes/${hero.slug}`}
                key={hero.slug}
                className="group flex items-center gap-2"
              >
                <img
                  src={`/images/heroes/${hero.slug}.png`}
                  alt={hero.name[0]}
                  className="size-8"
                />
                <span className="group-hover:underline">{hero.name}</span>
              </Link>
            ))}
          </CardContent>
        </Card>
      )}
      {/* Action Buttons */}
      <RequireEditor>
        <div className="flex gap-4">
          <Link
            to={`/equipment/${equipment.slug}/edit`}
            className={buttonVariants({ variant: "default" })}
            viewTransition
          >
            Edit
          </Link>
        </div>
      </RequireEditor>
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
          <Link
            to="/equipment"
            className={buttonVariants({ variant: "secondary" })}
            viewTransition
          >
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
