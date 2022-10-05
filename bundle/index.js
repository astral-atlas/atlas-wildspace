// @flow strict
import esbuild from 'esbuild';
import cssModules from 'esbuild-css-modules-plugin';
import { htmlPlugin } from '@craftamap/esbuild-plugin-html';

export const build = async (input, output) => {
  try {
    await esbuild.build({
      entryPoints: [input],
      bundle: true,
      outdir: output,
      //minify: true,
      treeShaking: true,
      metafile: true,
      format: 'esm',
      plugins: [cssModules({ bundle: true, v2: true })],
      loader: { '.png': 'binary' },
    })
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};
