// ABOUTME: Factory functions that return static providers or live repositories.
// ABOUTME: Uses isStaticMode() to determine which implementation to use.

import { isStaticMode } from "~/lib/static-mode";
import { EquipmentRepository } from "~/repositories/EquipmentRepository";
import { HeroRepository } from "~/repositories/HeroRepository";
import { MissionRepository } from "~/repositories/MissionRepository";
import {
  StaticEquipmentProvider,
  StaticHeroProvider,
  StaticMissionProvider,
} from "~/repositories/static";

export function createHeroRepository(
  request: Request,
): HeroRepository | StaticHeroProvider {
  if (isStaticMode()) return new StaticHeroProvider();
  return new HeroRepository(request);
}

export function createEquipmentRepository(
  request: Request,
): EquipmentRepository | StaticEquipmentProvider {
  if (isStaticMode()) return new StaticEquipmentProvider();
  return new EquipmentRepository(request);
}

export function createMissionRepository(
  request: Request,
): MissionRepository | StaticMissionProvider {
  if (isStaticMode()) return new StaticMissionProvider();
  return new MissionRepository(request);
}
