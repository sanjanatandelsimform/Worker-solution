import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  test: {
    globals: true,
    environment: "jsdom",
    setupFiles: "./tests/setup.ts",
    passWithNoTests: true,
    reporters: ["verbose"],
    server: {
      deps: {
        inline: ["@asamuzakjp/css-color", "cssstyle"],
      },
    },
    coverage: {
      provider: "v8",
      enabled: true,
      reporter: ["text", "text-summary", "json", "html", "lcov"],
      reportsDirectory: "./coverage",
      reportOnFailure: true,
      all: true,
      include: ["src/**/*.{ts,tsx}"],
      exclude: [
        "node_modules/**",
        "tests/**",
        "**/*.config.*",
        "dist/**",
        "src/main.tsx",
        "src/vite-env.d.ts",
        "src/**/*.d.ts",
        "src/**/*Types.ts",
        "src/**/*types.ts",
        "src/types/**",
        "src/assets/**",
        "src/constants/**",
      ],
    },
  },
});
