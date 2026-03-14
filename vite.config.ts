import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";
import Sitemap from "vite-plugin-sitemap";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },

  plugins: [
    react(),

    Sitemap({
      hostname: "https://prerakaschools.netlify.app",
      outDir: "dist",                 // ⭐ important fix
      generateRobotsTxt: true,       // generate robots.txt safely
      dynamicRoutes: [
        "/",
        "/about",
        "/contact"
      ],
    }),

  ],

  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },

  build: {
    outDir: "dist",
    emptyOutDir: true,               // ensures dist exists
    minify: "esbuild",
    sourcemap: mode === "development",
  },
}));
