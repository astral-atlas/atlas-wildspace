import { build } from '@lukekaalim/bundle';

const dir = new URL('.', import.meta.url).pathname;

build(dir + '/app.js', dir + '/dist');