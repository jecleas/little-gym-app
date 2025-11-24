import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { cloudflare } from "@cloudflare/vite-plugin";
import tailwindcss from '@tailwindcss/vite'

const routerAlias = new URL("./src/react-app/lib/router.tsx", import.meta.url).pathname;
const qrAlias = new URL("./src/react-app/lib/qrcode.react.tsx", import.meta.url).pathname;

export default defineConfig({
        plugins: [react(), cloudflare(), tailwindcss()],
        resolve: {
                alias: {
                        "react-router-dom": routerAlias,
                        "qrcode.react": qrAlias,
                },
        },
});
