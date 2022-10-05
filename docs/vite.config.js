export default {
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.ogg'],
  plugins: [
  ],
  build: {
    sourcemap: true,
    rollupOptions: {
      plugins: [
      ],
      input: {
        'main': 'index.html',
        '404': '404.html'
      }
    }
  },
}
