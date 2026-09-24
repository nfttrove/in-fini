import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { fileURLToPath } from 'node:url';

// Stamp the page with a hash of the source that ships, so the scheduled
// live-drift check can tell whether in-fini.com matches `main`. Labelling
// must never break a build (Bolt runs this too): the script is loaded and
// run inside the try, and any failure stamps "unknown".
async function buildId(): Promise<string> {
  try {
    const { computeBuildId } = await import('./scripts/build-id.mjs');
    return computeBuildId(fileURLToPath(new URL('.', import.meta.url)));
  } catch {
    return 'unknown';
  }
}

function buildIdMeta(id: string): Plugin {
  return {
    name: 'in-fini-build-id',
    transformIndexHtml: (html) =>
      html.replace('</head>', `  <meta name="in-fini-build" content="${id}" />\n  </head>`),
  };
}

// https://vitejs.dev/config/
export default defineConfig(async () => ({
  plugins: [react(), buildIdMeta(await buildId())],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
}));
