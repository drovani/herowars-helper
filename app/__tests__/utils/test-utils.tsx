import type { User } from "@supabase/supabase-js";
import type { RenderOptions } from "@testing-library/react";
import { render as rtlRender } from "@testing-library/react";
import type { ReactElement } from "react";
import { BrowserRouter } from "react-router";

// Mock user for testing
export const mockUser: User = {
  id: "test-user-id",
  email: "test@example.com",
  app_metadata: {
    roles: ["user"],
  },
  user_metadata: {},
  aud: "authenticated",
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
};

export const mockAdminUser: User = {
  ...mockUser,
  id: "test-admin-id",
  email: "admin@example.com",
  app_metadata: {
    roles: ["admin"],
  },
};

// Router wrapper for components that use React Router
const RouterWrapper = ({ children }: { children: React.ReactNode }) => (
  <BrowserRouter>{children}</BrowserRouter>
);

// Simple render function for components that don't need providers
export function render(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, options);
}

// Render function with routing context for components that use Link or other router features
export function renderWithRouter(ui: ReactElement, options?: RenderOptions) {
  return rtlRender(ui, {
    wrapper: RouterWrapper,
    ...options,
  });
}

// Re-export everything from testing library
export * from "@testing-library/react";
export { render as rtlRender };
