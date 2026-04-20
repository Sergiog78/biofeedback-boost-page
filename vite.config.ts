import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [react(), mode === "development" && componentTagger()].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    target: "es2020",
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Split heavy vendor libs into long-cacheable chunks.
        // CRITICAL: react, react-dom, scheduler, and react-router MUST stay
        // together in the same chunk. Splitting them causes
        // "Cannot read properties of undefined (reading '__SECRET_INTERNALS...')"
        // because react-dom evaluates before react is initialized.
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          // React core + everything that depends synchronously on it at import time
          if (
            id.includes("/react/") ||
            id.includes("/react-dom/") ||
            id.includes("/scheduler/") ||
            id.includes("/react-router") ||
            id.includes("/react-router-dom/") ||
            id.includes("@remix-run/router")
          ) {
            return "vendor-react";
          }
          if (id.includes("@stripe")) return "vendor-stripe";
          if (id.includes("@supabase")) return "vendor-supabase";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("embla-carousel")) return "vendor-carousel";
          // Everything else stays in the default vendor chunk so Rollup can
          // resolve cross-package dependencies safely.
          return "vendor";
        },
      },
    },
  },
}));
