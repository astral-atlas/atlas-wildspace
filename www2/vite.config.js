import { resolve } from 'path';

export default {
  resolve: {
    alias: { 'preact': '@lukekaalim/act', 'preact/hooks': '@lukekaalim/act' }
  },
  build: {
    outDir: 'artifacts',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
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