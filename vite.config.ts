import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    base: "/",

    server: {
      host: true,
      port: 3000,   // ✅ changed from 8080 to 3000
      strictPort: true,
    },

    plugins: [react()],

    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },

    build: {
      outDir: "dist",
      emptyOutDir: true,
      minify: "esbuild",
      sourcemap: isDev,

      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes("node_modules")) {
              return "vendor";
            }
          },
        },
      },

      chunkSizeWarningLimit: 1000,
    },
  };
});
