import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vitest/config";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [resolve(process.cwd(), "app/__tests__/setup.ts")],
    css: true,
    exclude: ["e2e/**/*", "node_modules/**/*", ".netlify/**/*", "claude-1/**/*", "claude-2/**/*"],
    coverage: {
      provider: "v8",
      clean: false,
      reporter: [["json", { file: "test-coverage.json" }]],
      reportsDirectory: "./build",
      include: [
        "app/**/*.{ts,tsx}",
      ],
      exclude: [
        "node_modules/",
        "app/__tests__/",
        ".netlify/",
        ".react-router/",
        "app/components/ui/",
        "**/*.d.ts",
        "build/",
        "netlify/",
        "vite.config.ts",
        "vitest.config.ts",
      ],
    },
  },
});
