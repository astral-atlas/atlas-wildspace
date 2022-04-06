import { resolve } from 'path';

export default {
  resolve: {
    alias: { 'preact': '@lukekaalim/act', 'preact/hooks': '@lukekaalim/act' }
  },
  build: {
    sourcemap: true,
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        admin: resolve(__dirname, 'admin/index.html'),
        room: resolve(__dirname, 'room/index.html'),
        characters: resolve(__dirname, 'characters/index.html'),
      },
    }
  },
  server: {
    port: 8081
  },
  assetsInclude: [
    '**/*.gltf',
    '**/*.md'
  ],
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
};