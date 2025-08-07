import { webcrypto } from 'crypto';

if (!globalThis.crypto) {
  globalThis.crypto = webcrypto as any;
}

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  base: "/fabellekiosk-frontend/app",
  optimizeDeps: {
    exclude: ["lucide-react"],
  },
});
