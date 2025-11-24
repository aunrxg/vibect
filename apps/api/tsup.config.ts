import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/server.ts"],
  format: ["cjs"],
  dts: false,
  sourcemap: true,
  clean: true,
  target: "node18",
  noExternal: ["@vibect/db"],
});
