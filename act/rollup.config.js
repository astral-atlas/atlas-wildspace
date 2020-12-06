import commonjs from '@rollup/plugin-commonjs'
import resolve from '@rollup/plugin-node-resolve';
import { terser } from "rollup-plugin-terser";
 
export default {
  input: "main.js",
  output: {
    file: './build/act.js',
    format: 'esm',
  },
  plugins: [terser(), resolve(), commonjs()],
};