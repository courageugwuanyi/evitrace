import { defineConfig } from "nitro";

export default defineConfig({
  externals: {
    inline: ["tslib", "@supabase/functions-js", "@supabase/supabase-js"],
  },
});
