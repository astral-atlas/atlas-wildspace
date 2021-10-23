// @flow strict
import { h } from "@lukekaalim/act";
import { render } from '@lukekaalim/act-web';

const Wildspace = () => {
  return [
    h('p', {}, `Go away`)
  ];
};

const main = () => {
  const { body } = document;
  if (!body)
    throw new Error();
  
  render(h(Wildspace), body);
};

main();