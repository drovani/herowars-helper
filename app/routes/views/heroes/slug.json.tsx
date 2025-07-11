import { type UIMatch } from "react-router";
import invariant from "tiny-invariant";
import EquipmentDataService from "~/services/EquipmentDataService";
import HeroDataService from "~/services/HeroDataService";
import { MissionRepository } from "~/repositories/MissionRepository";
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
  breadcrumb: (match: UIMatch<Route.ComponentProps["loaderData"], unknown>) => ({
    href: match.pathname.replace(/\.json$/, ""),
    title: match.data?.hero.name,
  }),
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.slug, "Missing hero slug param");

  const hero = await HeroDataService.getById(params.slug);
  if (!hero) {
    throw new Response(null, {
      status: 404,
      statusText: `Hero with slug ${params.slug} not found.`,
    });
  }

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
  const equipmentUsed = await EquipmentDataService.getAll(equipmentSlugs);
  const allHeroes = await HeroDataService.getAll();

  const currentIndex = allHeroes.findIndex((h) => h.slug === hero.slug);
  const prevHero = currentIndex > 0 ? allHeroes[currentIndex - 1] : null;
  const nextHero = currentIndex < allHeroes.length - 1 ? allHeroes[currentIndex + 1] : null;

  return { hero, prevHero, nextHero, campaignSources, equipmentUsed };
};

export default function Hero({ loaderData }: Route.ComponentProps) {
  const { hero, prevHero, nextHero, campaignSources, equipmentUsed } = loaderData;

  return <pre>{JSON.stringify({ hero, prevHero, nextHero, campaignSources, equipmentUsed }, null, 2)}</pre>;
}
