// vite.config.ts
import { defineConfig } from "@lovable.dev/vite-tanstack-config";
import { loadEnv } from "vite";

// Carrega variáveis do .env.local uma vez
const env = loadEnv(process.env.NODE_ENV || "development", process.cwd(), "");

export default defineConfig({
  tanstackStart: {
    server: { entry: "server" },
  },
  vite: {
    resolve: {
      tsconfigPaths: true, // ativa resolução nativa de paths do tsconfig
    },
    define: {
      "import.meta.env.VITE_SUPABASE_URL": JSON.stringify(env.VITE_SUPABASE_URL),
      "import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY": JSON.stringify(env.VITE_SUPABASE_PUBLISHABLE_KEY),
    },
    // se você tinha o plugin vite-tsconfig-paths em plugins: [], remova-o daqui
  },
});
