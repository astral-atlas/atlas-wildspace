import { resolve } from 'path';

export default {
  resolve: {
    alias: { 'preact': '@lukekaalim/act', 'preact/hooks': '@lukekaalim/act' }
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
  },
  server: {
    port: 8080
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