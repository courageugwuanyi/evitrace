// @lovable.dev/vite-tanstack-config already includes the following — do NOT add them manually
// or the app will break with duplicate plugins:
//   - tanstackStart, viteReact, tailwindcss, tsConfigPaths, nitro (build-only using cloudflare as a default target),
//     componentTagger (dev-only), VITE_* env injection, @ path alias, React/TanStack dedupe,
//     error logger plugins, and sandbox detection (port/host/strictPort).
// You can pass additional config via defineConfig({ vite: { ... }, etc... }) if needed.
import { defineConfig } from "@lovable.dev/vite-tanstack-config";

export default defineConfig({
  tanstackStart: {
    // Redirect TanStack Start's bundled server entry to src/server.ts (our SSR error wrapper).
    // nitro/vite builds from this
    server: { entry: "server" },
  },
  // Force-enable Nitro deploy plugin outside Lovable sandbox context.
  nitro: {
    externals: {
      inline: ["@supabase/functions-js", "@supabase/supabase-js"],
    },
  },
  vite: {
    // Route tslib to its native ESM build to avoid CJS interop wrappers in SSR output.
    resolve: {
      alias: {
        tslib: "tslib/tslib.es6.js",
      },
    },
    build: {
      chunkSizeWarningLimit: 1200,
    },
    ssr: {
      noExternal: ["tslib", "@supabase/functions-js", "@supabase/supabase-js"],
    },
  },
});
