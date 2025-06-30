/// <reference types="vitest" />
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: ["./app/__tests__/setup.ts"],
    css: true,
    coverage: {
      provider: "v8",
      clean: false,
      reporter: [["json", { file: "test-coverage.json" }]],
      reportsDirectory: "./app/data",
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
