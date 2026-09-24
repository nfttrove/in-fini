import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';
import { computeBuildId } from './scripts/build-id.mjs';

// Stamp the page with a hash of the source that ships, so the scheduled
// live-drift check can tell whether in-fini.com matches `main`. Labelling
// must never break a build (Bolt runs this too): fall back to "unknown".
function buildIdMeta(): Plugin {
  let id = 'unknown';
  try {
    id = computeBuildId(fileURLToPath(new URL('.', import.meta.url)));
  } catch {
    // keep "unknown"
  }
  return {
    name: 'in-fini-build-id',
    transformIndexHtml: (html) =>
      html.replace('</head>', `  <meta name="in-fini-build" content="${id}" />\n  </head>`),
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), buildIdMeta()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
