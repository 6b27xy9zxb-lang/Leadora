import { defineConfig } from "vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import viteTsConfigPaths from "vite-tsconfig-paths";
import { nitro } from "nitro/vite";

// Plain, provider-agnostic replacement for @lovable.dev/vite-tanstack-config.
// nitro() with no options auto-detects the deployment target at build time:
// it picks the Vercel preset on Vercel, Node on a plain VPS, etc. — no
// vendor-specific plugin needed. Point src/server.ts at the TanStack Start
// server entry the same way the old config did.
export default defineConfig({
  plugins: [
    viteTsConfigPaths({ projects: ["./tsconfig.json"] }),
    tailwindcss(),
    tanstackStart({
      server: { entry: "server" },
    }),
    nitro(),
    viteReact(),
  ],
});
