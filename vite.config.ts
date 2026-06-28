import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

export default defineConfig({
  plugins: [
    tanstackStart({
      server: {
        entry: "server",
        externals: {
          inline: [
            "tslib",
            "@supabase/supabase-js",
            "@supabase/auth-js",
            "@supabase/functions-js",
            "@supabase/postgrest-js",
            "@supabase/realtime-js",
            "@supabase/storage-js",
          ],
        },
      },
    }),
    react(),
    tailwindcss(),
  ],
  resolve: {
    tsconfigPaths: true,
    alias: {
      tslib: "tslib/tslib.es6.js",
    },
  },
  build: {
    chunkSizeWarningLimit: 1200,
  },
  ssr: {
    noExternal: [
      "tslib",
      "@supabase/supabase-js",
      "@supabase/auth-js",
      "@supabase/functions-js",
      "@supabase/postgrest-js",
      "@supabase/realtime-js",
      "@supabase/storage-js",
    ],
  },
});
