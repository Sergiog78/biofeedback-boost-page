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
    // No manualChunks: Rollup's automatic code-splitting safely preserves
    // module evaluation order. Forcing React + libraries that depend on it
    // (radix, lucide, react-hook-form, tanstack-query, etc.) into separate
    // chunks can cause "Cannot read properties of undefined (reading
    // 'forwardRef'/'__SECRET_INTERNALS_...')" because vendor chunks load
    // before react is initialized. Lazy-loaded routes/components already
    // create their own chunks.
  },
}));
