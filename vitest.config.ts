import { defineConfig } from "vitest/config";
import path from "path";

export default defineConfig({
  test: {
    environment: "node",
    globals: true,
  },
  resolve: {
    alias: [
      { find: /^@\/app\/(.*)/, replacement: path.resolve(__dirname, "./src/app/$1") },
      { find: "@", replacement: path.resolve(__dirname, "./") },
    ],
  },
});
