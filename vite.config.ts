import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [["babel-plugin-react-compiler"]],
      },
    }),
  ],
  build: {
    rollupOptions: {
      input: {
        // Main entry point (devtools panel)
        main: resolve(__dirname, "index.html"),

        // Entry point for the script that creates the DevTools panel
        devtools_page: resolve(__dirname, "src/extension/devtools.html"),
        devtools: resolve(__dirname, "src/extension/devtools.ts"),
        // Entry point for other required extension files
        background: resolve(__dirname, "src/extension/background.ts"),
        content_script: resolve(__dirname, "src/extension/content-script.ts"),
      },
      output: {
        entryFileNames: "src/extension/[name].js",
        chunkFileNames: "assets/[name].js",
        assetFileNames: "assets/[name].[ext]",
      },
    },
  },
});
