// @flow strict
import { h, Boundary, useEffect } from "@lukekaalim/act";
import { render } from './src/renderer';

import { App } from './src/App.js';
import { PrepPage } from "./src/prep/index.js";
import { Wildspace } from "./src";

const ErrorPage = ({ value }) => {
  useEffect(() => {
    console.error(value);
  }, [value]);
  return h('pre', {}, [
    JSON.stringify(value) || null,
  ])
}

const main = () => {
  const { body } = document;
  if (!body)
    return;
  render(h(Boundary, { fallback: ErrorPage }, h(App)), body);
};

main();