import { resolve } from 'path';

export default {
  resolve: {
    alias: { 'preact': '@lukekaalim/act', 'preact/hooks': '@lukekaalim/act' }
  },
  build: {
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
    port: 8080
  },
  css: {
    modules: {
      localsConvention: 'camelCaseOnly'
    }
  }
};