import { nodeResolve } from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import alias from '@rollup/plugin-alias';
import replace from '@rollup/plugin-replace';
import { terser } from 'rollup-plugin-terser';

export default {
  input: 'src/main.js',
  output: {
    file: 'public/bundle.js',
    format: 'es',
    sourcemap: true,
  },
  plugins: [ 
    replace({
      'process.env.NODE_ENV': JSON.stringify(process.env.NODE)
    }),
    //terser(),
    alias({
      entries: [
        { find: 'react', replacement: 'preact/compat' },
        { find: 'react-dom', replacement: 'preact/compat' }
      ]
    }),
    nodeResolve({ browser: true }),
    commonjs(),
  ]
};
