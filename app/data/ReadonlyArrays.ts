import type { z } from "zod";
import type { ArtifactSchema, SkinSchema } from "./hero.zod";

export const Stats = [
  "intelligence",
  "agility",
  "strength",
  "health",
  "physical attack",
  "magic attack",
  "armor",
  "magic defense",
  "dodge",
  "magic penetration",
  "vampirism",
  "armor penetration",
  "crit hit chance",
  "toughness",
  "magic reflection",
  "crushing",
  "magic crit hit chance",
] as const;

export const WeaponTeamBuff = [
  "armor",
  "dodge",
  "physical attack",
  "magic attack",
  "magic defense",
  "armor penetration",
  "crit hit chance",
  "magic penetration",
] as const;

export const ArtifactBookOptions = [
  "Alchemist's Folio",
  "Book of Illusions",
  "Defender's Covenant",
  "Manuscript of the Void",
  "Tome of Arcane Knowledge",
  "Warrior's Code",
] as const;

export const StoneSource = [
  "Arena Shop",
  "Campaign",
  "Heroic Chest",
  "Outland Shop",
  "Special Events",
  "Dungeon Shop",
  "Guild War Shop",
  "Grand Arena Shop",
  "Tower Shop",
  "Town Shop",
  "Highwayman Shop",
  "Hydra Shop",
  "Soul Shop",
];

export const ArtifactBookStats = {
  "Alchemist's Folio": ["armor penetration", "physical attack"],
  "Book of Illusions": ["dodge", "health"],
  "Defender's Covenant": ["armor", "magic defense"],
  "Manuscript of the Void": ["magic attack", "magic penetration"],
  "Tome of Arcane Knowledge": ["magic attack", "health"],
  "Warrior's Code": ["physical attack", "crit hit chance"],
} as const;

// Quality levels for equipment upgrades
export const HeroRankLevel = [
  "white",
  "green",
  "green+1",
  "blue",
  "blue+1",
  "blue+2",
  "violet",
  "violet+1",
  "violet+2",
  "violet+3",
  "orange",
  "orange+1",
  "orange+2",
  "orange+3",
  "orange+4",
] as const;

export const HeroClass = [
  "tank",
  "warrior",
  "mage",
  "support",
  "control",
  "marksman",
  "healer",
] as const;
export const HeroFaction = [
  "nature",
  "chaos",
  "honor",
  "eternity",
  "mystery",
  "progress",
] as const;
export const HeroMainStat = ["strength", "agility", "intelligence"] as const;
export const AttackType = ["physical", "magic", "pure"] as const;

// Export additional type helpers
export type HeroClass = (typeof HeroClass)[number];
export type HeroFaction = (typeof HeroFaction)[number];
export type HeroMainStat = (typeof HeroMainStat)[number];
export type HeroRankLevel = (typeof HeroRankLevel)[number];
export type HeroStat = (typeof Stats)[number];
export type WeaponTeamBuff = (typeof WeaponTeamBuff)[number];
export type ArtifactBookOption = (typeof ArtifactBookOptions)[number];
export type HeroSkin = z.infer<typeof SkinSchema>;
export type HeroArtifact = z.infer<typeof ArtifactSchema>;
export type AttackType = (typeof AttackType)[number];
export type StoneSource = (typeof StoneSource)[number];
