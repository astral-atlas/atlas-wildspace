import { resolve } from 'path';
import { readFileSync } from 'fs';

export default {
  optimizeDeps: {
    esbuildOptions: {
      loader: {
        '.glb': 'dataurl',
        '.glsl': 'text',
        '.md': 'text',
      },
    }
  },
  resolve: {
    alias: { 'preact': '@lukekaalim/act', 'preact/hooks': '@lukekaalim/act' }
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
  server: {
    port: 8080,
    //key: readFileSync('../localhost.key'),
    //cert: readFileSync('../localhost.cert')
  },
  assetsInclude: [
    '**/*.glb',
    '**/*.gltf',
    '**/*.md'
  ],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
};