import { defineConfig } from "vite";

export default defineConfig({
  root: ".",
  server: {
    port: 5000,
    open: true,
    watch: {
      usePolling: true,
    },
  },
  build: {
    outDir: "dist",
    emptyOutDir: true,
    rollupOptions: {
      input: "index.html",
    },
  },
});
