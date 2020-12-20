// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { StyleSheet } from '../lib/style'; */
import { h, Fragment } from 'preact';
import { useErrorBoundary } from 'preact/hooks';

import { Header } from './header';
import { Footer } from './footer';
import { cssClass, cssElement, cssStylesheet } from '../lib/style';

const bodyRules = cssElement('body', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
});
const pageClass = cssClass('page', {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
});
const pageContentClass = cssClass('page-content', {
  flexGrow: '1',
  width: '100%',
  overflow: 'auto',
});
export const pageStyles/*: StyleSheet*/ = cssStylesheet([
  bodyRules,
  pageContentClass,
  pageClass
]);

/*::
type PageProps = {
  children: Node,
};
*/

export const Page = ({ children }/*: PageProps*/)/*: Node*/ => {
  const [error] = useErrorBoundary();

  if (error)
    console.error(error);

  return h('div', { class: 'page' }, [
    h(Header),
    h('div', { class: 'page-content' }, [
      !error && children,
      error && h('pre', {}, error.message),
      error && h('pre', {}, error.stack),
    ]),
    h(Footer),
  ]);
};
