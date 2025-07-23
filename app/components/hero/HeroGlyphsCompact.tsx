import type { ClassValue } from "clsx";
import type { HeroRecord } from "~/data/hero.zod";
import { cn, generateSlug } from "~/lib/utils";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "../ui/hover-card";

interface HeroGlyphsCompactProps {
  glyphs: HeroRecord["glyphs"];
  className?: ClassValue;
}

export default function HeroGlyphsCompact({
  glyphs,
  className,
}: HeroGlyphsCompactProps) {
  if (glyphs == null) return <div className={cn(className)} />;

  return (
    <div className={cn("flex flex-col justify-evenly items-center", className)}>
      {glyphs.map((glyph, index) => (
        <HoverCard key={index}>
          <HoverCardTrigger asChild>
            <img
              key={index}
              src={`/images/stats/${generateSlug(glyph || "placeholder")}.png`}
              alt={glyph || "No glyph selected"}
              className="size-10 cursor-pointer"
            />
          </HoverCardTrigger>
          <HoverCardContent>
            <div className="font-medium capitalize">
              {glyph || "No glyph selected"}
            </div>
            <img
              src={`/images/stats/${generateSlug(glyph || "placeholder")}.png`}
              alt={glyph || "No glyph selected"}
              className="size-16"
            />
          </HoverCardContent>
        </HoverCard>
      ))}
    </div>
  );
}
