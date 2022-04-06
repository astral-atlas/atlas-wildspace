// @flow strict
import { h } from "@lukekaalim/act";
import { render } from '@lukekaalim/act-three';
import { renderAppPage } from "./app.js";

import { Wildspace } from './src/index.js';

const main = () => {
  renderAppPage(Wildspace)
};

main();