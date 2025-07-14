import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, type UIMatch } from "react-router";
import invariant from "tiny-invariant";
import { RequireEditor } from "~/components/auth/RequireRole";
import HeroArtifacts from "~/components/hero/HeroArtifacts";
import HeroGlyphs from "~/components/hero/HeroGlyphs";
import HeroItems from "~/components/hero/HeroItems";
import HeroSkins from "~/components/hero/HeroSkins";
import HeroStoneSources from "~/components/hero/HeroStoneSources";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import { MissionRepository } from "~/repositories/MissionRepository";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { createDatabaseHeroService } from "~/services/DatabaseHeroService";
import type { Route } from "./+types/slug";

export const meta = ({ data }: Route.MetaArgs) => {
  return [{ title: data?.hero.name }];
};

export const handle = {
  breadcrumb: (match: UIMatch<Route.ComponentProps["loaderData"], unknown>) => ({
    href: match.pathname,
    title: match.data?.hero.name,
  }),
};

export const loader = async ({ params, request }: Route.LoaderArgs) => {
  invariant(params.slug, "Missing hero slug param");

  const heroService = createDatabaseHeroService(request);
  const hero = await heroService.getById(params.slug);
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

  const missions = campaignSourcesResult.data || [];

  // Convert Mission[] to MissionRecord[] for compatibility with existing components
  const campaignSources = missions.map(mission => ({
    id: mission.slug,
    chapter: mission.chapter_id,
    chapter_title: "", // We'd need to fetch this from chapters table
    mission_number: parseInt(mission.slug.split('-')[1]),
    name: mission.name,
    boss: mission.hero_slug || undefined,
    updated_on: new Date().toISOString()
  }));

  const equipmentSlugs: string[] = [];
  if (hero.items !== undefined) {
    for (const itemSlugs of Object.values(hero.items)) {
      equipmentSlugs.push(...itemSlugs);
    }
  }
  const equipmentRepo = new EquipmentRepository(request);
  const equipmentUsedResult = await equipmentRepo.getAllAsJson();
  
  if (equipmentUsedResult.error) {
    throw new Response("Failed to load equipment", { status: 500 });
  }
  
  // Filter to only the equipment used by this hero
  const equipmentUsed = equipmentUsedResult.data?.filter(eq => equipmentSlugs.includes(eq.slug)) || [];
  const allHeroes = await heroService.getAll();

  const currentIndex = allHeroes.findIndex((h) => h.slug === hero.slug);
  const prevHero = currentIndex > 0 ? allHeroes[currentIndex - 1] : null;
  const nextHero = currentIndex < allHeroes.length - 1 ? allHeroes[currentIndex + 1] : null;

  return { hero, prevHero, nextHero, campaignSources, equipmentUsed };
};

export default function Hero({ loaderData }: Route.ComponentProps) {
  const { hero, prevHero, nextHero, campaignSources, equipmentUsed } = loaderData;
  const navigate = useNavigate();

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.target instanceof HTMLInputElement || event.target instanceof HTMLTextAreaElement) {
        return;
      }

      switch (event.key) {
        case "ArrowLeft":
          if (prevHero) {
            navigate(`/heroes/${prevHero.slug}`);
          }
          break;
        case "ArrowRight":
          if (nextHero) {
            navigate(`/heroes/${nextHero.slug}`);
          }
          break;
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [navigate, prevHero, nextHero]);

  return (
    <div className="space-y-8">
      <div className="flex items-start gap-6">
        <div className="size-32 bg-muted rounded">
          <img src={`/images/heroes/${hero.slug}.png`} alt={hero.name[0]} className="size-32" />
        </div>
        <div className="space-y-4">
          <div>
            <h1 className="text-3xl font-bold mb-2">{hero.name}</h1>
            <div className="flex gap-2">
              <div className="capitalize flex gap-1">
                <img src={`/images/classes/${hero.class}.png`} alt={hero.class} className="w-6 h-6" />
                {hero.class}
              </div>
              <Badge variant="outline">
                Way of&nbsp;<span className="capitalize">{hero.faction}</span>
              </Badge>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="text-sm space-y-2">
              <div>Main Stat:</div>
              <div className="font-semibold capitalize flex gap-1">
                <img src={`/images/stats/${hero.main_stat}.png`} alt={hero.main_stat} className="w-6 h-6" />
                {hero.main_stat}
              </div>
            </div>
            <div className="text-sm space-y-2">
              <div>Attack Types:</div>
              <div className="flex gap-2">
                {hero.attack_type.map((type) => (
                  <Badge key={type} variant="outline" className="capitalize">
                    {type}
                  </Badge>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <HeroItems items={hero.items} equipment={equipmentUsed} />
      <HeroSkins skins={hero.skins} heroSlug={hero.slug} />
      <HeroArtifacts artifacts={hero.artifacts} main_stat={hero.main_stat} />
      <HeroGlyphs glyphs={hero.glyphs} />
      <HeroStoneSources stoneSource={hero.stone_source} campaignSources={campaignSources} />

      <RequireEditor>
        <div className="flex gap-4">
          <Link to={`/heroes/${hero.slug}/edit`} className={buttonVariants({ variant: "default" })} viewTransition>
            Edit
          </Link>
        </div>
      </RequireEditor>

      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-4 w-full">
        <div className="flex justify-start w-full sm:w-auto">
          {prevHero ? (
            <Link to={`/heroes/${prevHero.slug}`} className={buttonVariants({ variant: "outline" })} viewTransition>
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              {prevHero.name}
            </Link>
          ) : (
            <div />
          )}
        </div>
        <div className="flex justify-center w-full sm:w-auto">
          <Link to="/heroes" className={buttonVariants({ variant: "secondary" })} viewTransition>
            All Heroes
          </Link>
        </div>
        <div className="flex justify-end w-full sm:w-auto">
          {nextHero ? (
            <Link to={`/heroes/${nextHero.slug}`} className={buttonVariants({ variant: "outline" })} viewTransition>
              {nextHero.name}
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
