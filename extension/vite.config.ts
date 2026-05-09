import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "node:path";

export default defineConfig({
  plugins: [react()],
  root: __dirname,
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        popup: path.resolve(__dirname, "popup.html"),
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, ".."),
      "@kdp": path.resolve(__dirname, "../lib/kdp"),
    },
  },
});
