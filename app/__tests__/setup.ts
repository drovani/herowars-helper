import "@testing-library/jest-dom";
import { afterAll, afterEach, beforeAll, vi } from "vitest";
import { server } from "./mocks/msw/server";

// Set up test environment variables for Supabase
process.env.VITE_SUPABASE_DATABASE_URL = "https://test-project.supabase.co";
process.env.VITE_SUPABASE_ANON_KEY = "test-anon-key";
process.env.SUPABASE_DATABASE_URL = "https://test-project.supabase.co";
process.env.SUPABASE_ANON_KEY = "test-anon-key";

// Mock window.matchMedia
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock scrollTo
Object.defineProperty(window, "scrollTo", {
  value: vi.fn(),
  writable: true,
});

// MSW setup
beforeAll(() => {
  // Start MSW server before all tests
  server.listen({ onUnhandledRequest: "error" });
});

afterEach(() => {
  // Reset MSW handlers after each test to ensure test isolation
  server.resetHandlers();
});

afterAll(() => {
  // Clean up MSW server after all tests
  server.close();
});
