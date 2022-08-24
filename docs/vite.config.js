import { identify } from "@lukekaalim/identify";

export default {
  assetsInclude: ['**/*.gltf', '**/*.glb', '**/*.ogg'],
  plugins: [
    identify()
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
