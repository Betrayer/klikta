import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        advancedChunks: {
          groups: [
            {
              name: "firebase",
              test: /[\\/]node_modules[\\/](@firebase|firebase)[\\/]/,
            },
            {
              name: "pixi",
              test: /[\\/]node_modules[\\/](pixi\.js|@pixi)[\\/]/,
            },
          ],
        },
      },
    },
  },
});
