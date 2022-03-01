
export default {
  assetsInclude: ['**/*.gltf'],
  build: {
    sourcemap: true,
    rollupOptions: {
      input: {
        'main': 'index.html',
        '404': '404.html'
      }
    }
  },
}
