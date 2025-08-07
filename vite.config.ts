// 👇 Must come FIRST — before anything else
import './vite.crypto.patch';

import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  base: '/fabellekiosk-frontend/app',
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
