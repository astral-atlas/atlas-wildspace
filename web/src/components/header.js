// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';

const Header = ()/*: Node*/ => {
  return h('header', {}, [
    h('h1', {}, 'Wildspace')
  ])
};

export {
  Header,
};
