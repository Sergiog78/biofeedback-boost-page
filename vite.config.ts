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
        // Split heavy vendor libs into their own long-cacheable chunks so the
        // initial landing-page bundle stays small.
        manualChunks: (id) => {
          if (!id.includes("node_modules")) return undefined;
          if (id.includes("@stripe")) return "vendor-stripe";
          if (id.includes("@radix-ui")) return "vendor-radix";
          if (id.includes("@supabase")) return "vendor-supabase";
          if (id.includes("@tanstack")) return "vendor-query";
          if (id.includes("react-hook-form") || id.includes("@hookform")) return "vendor-forms";
          if (id.includes("recharts") || id.includes("d3-")) return "vendor-charts";
          if (id.includes("embla-carousel")) return "vendor-carousel";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("react-router")) return "vendor-router";
          if (id.includes("react-dom") || id.includes("scheduler")) return "vendor-react";
          return "vendor";
        },
      },
    },
  },
}));
