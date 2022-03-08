
export default {
  assetsInclude: ['**/*.gltf', '**/*.ogg'],
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
