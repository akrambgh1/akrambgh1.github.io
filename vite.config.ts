import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// User site (akrambgh1.github.io) is served from the domain root
export default defineConfig({
  plugins: [react()],
  base: "/",
  build: {
    rollupOptions: {
      output: {
        // Keep the 3D engine in its own chunk so the page text loads first
        manualChunks: { three: ["three", "@react-three/fiber"] },
      },
    },
  },
});
