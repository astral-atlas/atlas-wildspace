// @flow strict
import { h } from "@lukekaalim/act";
import { render } from '@lukekaalim/act-three';
import { renderAppPage } from "./app.js";

import { Wildspace } from './src/index.js';

const main = () => {
  render(
    h(Wildspace),
    (document.body/*: any*/)
  )
};

main();