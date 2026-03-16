import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

// In modern Node (v20.11+ / v21.2+), we can use the built-in __dirname logic 
// more simply if your environment supports it, but your current url logic is fine too.

export default defineConfig(({ mode }) => {
  const isDev = mode === "development";

  return {
    // Matches your repo name: https://<username>.github.io/Preraka-Schools/
    base: "/Preraka-Schools/", 

    server: {
      host: true, // Listens on all local IP addresses (IPv4 & IPv6)
      port: 8080,
      strictPort: true, // Fails if 8080 is busy instead of picking a random one
    },

    plugins: [react()],

    resolve: {
      alias: {
        // Using fileURLToPath is safer across different OS environments
        "@": path.resolve(path.dirname(import.meta.url).replace('file://', ''), "./src"),
      },
    },

    build: {
      outDir: "dist",
      emptyOutDir: true,
      minify: "esbuild",
      // Set to true if you want to debug the production build in browser tools
      sourcemap: isDev, 
      rollupOptions: {
        output: {
          // Manual chunking helps with caching on GitHub Pages
          manualChunks: {
            vendor: ["react", "react-dom"],
          },
        },
      },
    },
  };
});
