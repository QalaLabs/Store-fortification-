import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    // Order matters: the App Router (UI pages + API routes) lives under src/app,
    // backend modules (lib/*) live at the repo root. Mirrors tsconfig "@/*" -> ["./src/*", "./*"].
    alias: [
      { find: /^@\/app\//, replacement: path.resolve(__dirname, "./src/app") + "/" },
      { find: /^@\//, replacement: path.resolve(__dirname, "./") + "/" },
    ],
  },
});
