// hero.zod.ts
import { z } from "zod";

import {
  ArtifactBookOptions,
  type AttackType,
  type HeroClass,
  type HeroFaction,
  type HeroMainStat,
  Stats,
  type StoneSource,
  WeaponTeamBuff,
} from "./ReadonlyArrays";

export const SkinSchema = z.object({
  name: z.string(),
  stat: z.enum(Stats),
  has_plus: z.boolean().default(false),
  source: z.string().optional(),
});

export const ArtifactSchema = z.object({
  weapon: z.object({
    name: z.string(),
    team_buff: z.enum(WeaponTeamBuff),
    team_buff_secondary: z.enum(WeaponTeamBuff).optional(),
  }),
  book: z.enum(ArtifactBookOptions),
  ring: z.null().optional(),
});

// Equipment list for each quality level must have exactly 6 items
export const ItemsSchema = z.object({
  white: z.array(z.string()).length(6).optional(),
  green: z.array(z.string()).length(6).optional(),
  "green+1": z.array(z.string()).length(6).optional(),
  blue: z.array(z.string()).length(6).optional(),
  "blue+1": z.array(z.string()).length(6).optional(),
  "blue+2": z.array(z.string()).length(6).optional(),
  violet: z.array(z.string()).length(6).optional(),
  "violet+1": z.array(z.string()).length(6).optional(),
  "violet+2": z.array(z.string()).length(6).optional(),
  "violet+3": z.array(z.string()).length(6).optional(),
  orange: z.array(z.string()).length(6).optional(),
  "orange+1": z.array(z.string()).length(6).optional(),
  "orange+2": z.array(z.string()).length(6).optional(),
  "orange+3": z.array(z.string()).length(6).optional(),
  "orange+4": z.array(z.string()).length(6).optional(),
});

export const HeroMutationSchema = z
  .object({
    artifacts: ArtifactSchema.optional(),
    skins: z.array(SkinSchema).min(1).optional(),
    items: ItemsSchema.optional(),
    glyphs: z.array(z.enum(Stats).optional()).length(5).optional(),
    slug: z.string().readonly(),
  })
  .transform((hero) => {
    return {
      ...hero,
      updated_on: new Date().toISOString(),
    };
  });

export type HeroMutation = z.input<typeof HeroMutationSchema>;

export type HeroRecord = z.infer<typeof HeroMutationSchema> & {
  name: string;
  class: HeroClass;
  faction: HeroFaction;
  main_stat: HeroMainStat;
  attack_type: AttackType[];
  stone_source: StoneSource[];
  order_rank: number;
};
