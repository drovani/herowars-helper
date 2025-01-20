import { ArrowLeftIcon, ArrowRightIcon } from "lucide-react";
import { useEffect } from "react";
import { Link, useNavigate, type UIMatch } from "react-router";
import invariant from "tiny-invariant";
import HeroArtifacts from "~/components/hero/HeroArtifacts";
import HeroGlyphs from "~/components/hero/HeroGlyphs";
import HeroItems from "~/components/hero/HeroItems";
import HeroSkins from "~/components/hero/HeroSkins";
import HeroStoneSources from "~/components/hero/HeroStoneSources";
import { Badge } from "~/components/ui/badge";
import { buttonVariants } from "~/components/ui/button";
import EquipmentDataService from "~/services/EquipmentDataService";
import HeroDataService from "~/services/HeroDataService";
import MissionDataService from "~/services/MissionDataService";
import type { Route } from "./+types/heroes.$slug";

export const meta = ({ data }: Route.MetaArgs) => {
  return [{ title: data?.hero.name }];
};

export const handle = {
  breadcrumb: (match: UIMatch<Route.ComponentProps["loaderData"], unknown>) => ({
    href: match.pathname,
    title: match.data?.hero.name,
  }),
};

export const loader = async ({ params }: Route.LoaderArgs) => {
  invariant(params.slug, "Missing hero slug param");

  const hero = await HeroDataService.getById(params.slug);
  if (!hero) {
    throw new Response(null, {
      status: 404,
      statusText: `Hero with slug ${params.slug} not found.`,
    });
  }

  const campaignSources = await MissionDataService.getMissionsByBoss(hero.name);
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
      {/* Header Section */}
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

      {/* Glyphs Section */}
      <HeroGlyphs hero={hero} />

      <HeroItems items={hero.items} equipment={equipmentUsed} />

      {/* Skins Section */}
      <HeroSkins hero={hero} />

      {/* Artifacts Section */}
      <HeroArtifacts hero={hero} />

      {/* Stone Sources Section */}
      <HeroStoneSources hero={hero} campaignSources={campaignSources} />

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Link to={`/heroes/${hero.slug}/edit`} className={buttonVariants({ variant: "default" })} viewTransition>
          Edit
        </Link>
      </div>

      {/* Navigation Buttons */}
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
