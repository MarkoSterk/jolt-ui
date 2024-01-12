import { fileURLToPath, URL } from "node:url";
import { defineConfig } from "vite";
import topLevelAwait from "vite-plugin-top-level-await";

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    topLevelAwait({
      // The export name of top-level await promise for each chunk module
      promiseExportName: "__tla",
      // The function to generate import names of top-level await promise in each chunk module
      promiseImportName: i => `__tla_${i}`
    })
  ],
  resolve: {
    alias: {
      "@app": fileURLToPath(new URL("<appPath>", import.meta.url)),
      "@components": fileURLToPath(new URL("<componentPath>", import.meta.url)),
    },
  },
});