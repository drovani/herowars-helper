/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: [resolve(process.cwd(), "app/__tests__/setup.ts")],
    css: true,
    exclude: ["e2e/**/*", "node_modules/**/*", ".netlify/**/*"],
    coverage: {
      provider: "v8",
      clean: false,
      reporter: [["json", { file: "test-coverage.json" }]],
      reportsDirectory: "./build",
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
