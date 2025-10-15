import { type UIMatch } from "react-router";
import invariant from "tiny-invariant";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { HeroRepository } from "~/repositories/HeroRepository";
import { MissionRepository } from "~/repositories/MissionRepository";
import {
  transformCompleteHeroToRecord,
  transformBasicHeroToRecord,
  sortHeroRecords,
} from "~/lib/hero-transformations";
import type { Route } from "./+types/slug.json";

export const meta = ({ data }: Route.MetaArgs) => {
  return [
    { title: data?.hero.name },
    { name: "robots", content: "noindex" },
    { rel: "canonical", href: `/heroes/${data?.hero.slug}` },
    {
      name: "description",
      content: `JSON details for ${data?.hero.name} hero. Internal administrative page.`,
    },
  ];
};

export const handle = {
  breadcrumb: (
    match: UIMatch<Route.ComponentProps["loaderData"], unknown>,
  ) => ({
    href: match.pathname.replace(/\.json$/, ""),
    title: match.loaderData?.hero.name,
  }),
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.slug, "Missing hero slug param");

  const heroRepo = new HeroRepository(request);
  const heroResult = await heroRepo.findWithAllData(params.slug);

  if (heroResult.error || !heroResult.data) {
    throw new Response(null, {
      status: 404,
      statusText: `Hero with slug ${params.slug} not found.`,
    });
  }

  const hero = transformCompleteHeroToRecord(heroResult.data);

  const missionRepo = new MissionRepository(request);
  const campaignSourcesResult = await missionRepo.findByHeroSlug(hero.name);

  if (campaignSourcesResult.error) {
    throw new Response("Failed to load campaign sources", { status: 500 });
  }

  const campaignSources = campaignSourcesResult.data || [];
  const equipmentSlugs: string[] = [];
  if (hero.items !== undefined) {
    for (const tier of Object.entries(hero.items)) {
      equipmentSlugs.push(...tier[1]);
    }
  }
  const equipmentRepo = new EquipmentRepository(request);
  const equipmentUsedResult = await equipmentRepo.findAll();

  if (equipmentUsedResult.error) {
    throw new Response("Failed to load equipment", { status: 500 });
  }

  // Filter to only the equipment used by this hero
  const equipmentUsed =
    equipmentUsedResult.data?.filter((eq) =>
      equipmentSlugs.includes(eq.slug),
    ) || [];

  // Get all heroes for navigation
  const allHeroesResult = await heroRepo.findAll();
  if (allHeroesResult.error) {
    throw new Response("Failed to load heroes for navigation", { status: 500 });
  }

  const allHeroes = allHeroesResult.data
    ? await Promise.all(
        allHeroesResult.data.map(async (h) => {
          const completeHeroResult = await heroRepo.findWithAllData(h.slug);
          if (completeHeroResult.data) {
            return transformCompleteHeroToRecord(completeHeroResult.data);
          }
          return transformBasicHeroToRecord(h);
        }),
      )
    : [];

  const sortedHeroes = sortHeroRecords(allHeroes);
  const currentIndex = sortedHeroes.findIndex((h) => h.slug === hero.slug);
  const prevHero = currentIndex > 0 ? sortedHeroes[currentIndex - 1] : null;
  const nextHero =
    currentIndex < sortedHeroes.length - 1
      ? sortedHeroes[currentIndex + 1]
      : null;

  return { hero, prevHero, nextHero, campaignSources, equipmentUsed };
};

export default function Hero({ loaderData }: Route.ComponentProps) {
  const { hero, prevHero, nextHero, campaignSources, equipmentUsed } =
    loaderData;

  return (
    <pre>
      {JSON.stringify(
        { hero, prevHero, nextHero, campaignSources, equipmentUsed },
        null,
        2,
      )}
    </pre>
  );
}
