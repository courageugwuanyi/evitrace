import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    tanstackStart(),
    nitro({
      preset: "vercel",
      externals: {
        inline: [
          "@supabase/supabase-js",
          "@supabase/auth-js",
          "@supabase/functions-js",
          "@supabase/postgrest-js",
          "@supabase/realtime-js",
          "@supabase/storage-js",
        ],
      },
    }),
    tsconfigPaths(),
    tailwindcss(),
  ],
  build: {
    chunkSizeWarningLimit: 1200,
  },
  ssr: {
    noExternal: [
      "@supabase/supabase-js",
      "@supabase/auth-js",
      "@supabase/functions-js",
      "@supabase/postgrest-js",
      "@supabase/realtime-js",
      "@supabase/storage-js",
    ],
  },
});
