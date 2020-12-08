// @flow strict
/*:: import type { Node } from 'preact'; */
import { h } from 'preact';
import { HeaderLoginButton } from './header/login';
import { HeaderGameSelectButton } from './header/game';

export const style = `
  .page-header {
    position: sticky;
    top: 0;
    display: flex;
    flex-direction: row;
    height: 3em;
    align-items: center;
    width: 100%;
    
    background: white;
    box-shadow: 0px 0px 15px #c1c1c1;
    z-index: 1;
  }
  .page-header-title-text {
    flex-grow: 1;
    margin: 0;
  }
`;

const Header = ()/*: Node*/ => {
  return h('header', { class: 'page-header' }, [
    h('h1', { class: 'page-header-title-text' }, 'Wildspace'),
    h(HeaderGameSelectButton),
    h(HeaderLoginButton),
  ])
};

export {
  Header,
};
