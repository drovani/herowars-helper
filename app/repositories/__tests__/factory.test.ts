// ABOUTME: Tests for repository factory functions that select static or live implementations.
// ABOUTME: Verifies correct provider is returned based on isStaticMode result.

import { describe, expect, it, vi, afterEach } from "vitest";

// Mock the static-mode module before importing factory
vi.mock("~/lib/static-mode", () => ({
  isStaticMode: vi.fn(),
}));

// Mock the live repositories to avoid needing Supabase
vi.mock("~/repositories/HeroRepository", () => ({
  HeroRepository: class MockHeroRepository {
    type = "live-hero";
  },
}));

vi.mock("~/repositories/EquipmentRepository", () => ({
  EquipmentRepository: class MockEquipmentRepository {
    type = "live-equipment";
  },
}));

vi.mock("~/repositories/MissionRepository", () => ({
  MissionRepository: class MockMissionRepository {
    type = "live-mission";
  },
}));

import { isStaticMode } from "~/lib/static-mode";
import {
  createHeroRepository,
  createEquipmentRepository,
  createMissionRepository,
} from "../factory";
import { StaticHeroProvider } from "../static/StaticHeroProvider";
import { StaticEquipmentProvider } from "../static/StaticEquipmentProvider";
import { StaticMissionProvider } from "../static/StaticMissionProvider";

const mockIsStaticMode = vi.mocked(isStaticMode);

afterEach(() => {
  vi.clearAllMocks();
});

describe("createHeroRepository", () => {
  it("returns a StaticHeroProvider when in static mode", () => {
    mockIsStaticMode.mockReturnValue(true);
    const request = new Request("http://localhost/");
    const repo = createHeroRepository(request);
    expect(repo).toBeInstanceOf(StaticHeroProvider);
  });

  it("returns a HeroRepository when not in static mode", () => {
    mockIsStaticMode.mockReturnValue(false);
    const request = new Request("http://localhost/");
    const repo = createHeroRepository(request);
    expect(repo).not.toBeInstanceOf(StaticHeroProvider);
  });
});

describe("createEquipmentRepository", () => {
  it("returns a StaticEquipmentProvider when in static mode", () => {
    mockIsStaticMode.mockReturnValue(true);
    const request = new Request("http://localhost/");
    const repo = createEquipmentRepository(request);
    expect(repo).toBeInstanceOf(StaticEquipmentProvider);
  });

  it("returns an EquipmentRepository when not in static mode", () => {
    mockIsStaticMode.mockReturnValue(false);
    const request = new Request("http://localhost/");
    const repo = createEquipmentRepository(request);
    expect(repo).not.toBeInstanceOf(StaticEquipmentProvider);
  });
});

describe("createMissionRepository", () => {
  it("returns a StaticMissionProvider when in static mode", () => {
    mockIsStaticMode.mockReturnValue(true);
    const request = new Request("http://localhost/");
    const repo = createMissionRepository(request);
    expect(repo).toBeInstanceOf(StaticMissionProvider);
  });

  it("returns a MissionRepository when not in static mode", () => {
    mockIsStaticMode.mockReturnValue(false);
    const request = new Request("http://localhost/");
    const repo = createMissionRepository(request);
    expect(repo).not.toBeInstanceOf(StaticMissionProvider);
  });
});
