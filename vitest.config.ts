import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  test: {
    // Default environment
    environment: "jsdom",

    // Setup files
    setupFiles: ["./tests/setup.ts"],

    // Include patterns
    include: [
      "tests/**/*.test.ts",
      "tests/**/*.test.tsx",
      "client/src/**/*.test.ts",
      "client/src/**/*.test.tsx",
      "server/**/*.test.ts",
      "shared/**/*.test.ts",
    ],

    // Exclude patterns
    exclude: ["node_modules", "dist"],

    // Coverage configuration
    coverage: {
      provider: "v8",
      reporter: ["text", "html"],
      include: ["client/src/**/*", "server/**/*", "shared/**/*"],
      exclude: ["**/*.test.ts", "**/*.test.tsx", "**/index.ts"],
    },

    // Global test timeout
    testTimeout: 10000,

    // Reporter
    reporters: ["default"],

    // Globals (describe, it, expect without imports)
    globals: true,
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
      "@server": path.resolve(__dirname, "./server"),
    },
  },
});
