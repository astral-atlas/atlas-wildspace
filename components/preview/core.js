// @flow strict
/*:: import type { Component, SetValue, ElementNode } from '@lukekaalim/act'; */
/*:: import type { Page } from './page'; */
import { h, useState, useMemo } from '@lukekaalim/act';
import { PageNavigation } from './page.js';
import { ReadmePageContent } from './readmePageContent.js';
import { renderWorkspacePageContent } from "./workspacePageContent.js";

import previewMd from './preview.md?raw';
import styles from './previewStyles.module.css';
import { TabbedToolbox } from './tools/tabs.js';
import { GridBench } from './bench/grid.js';
import { JSONEditorInput } from './tools/json.js';

/*::
export type PreviewAppProps = {|
  title: ElementNode,
  root: Page,
|};
*/

const useStorageState = /*:: <T>*/(key/*: string*/, defaultValue/*: T*/)/*: [T, SetValue<T>]*/ => {
  const initialState = useMemo(() => {
    try {
      return JSON.parse(window.localStorage.getItem(key));
    } catch (error) {
      return defaultValue;
    }
  }, []);
  const [state, setState] = useState(initialState);

  const setAndStoreState = (updater/*: any*/) => {
    if (typeof updater === 'function')
      window.localStorage.setItem(key, JSON.stringify(updater(state)))
    else
      window.localStorage.setItem(key, JSON.stringify(updater))
    setState(updater);
  };

  return [state, setAndStoreState];
};

const pageA = {
  href: '/#pageA',
  name: 'pageA',
  content: [
    renderWorkspacePageContent({
      defaultProps: { value: true },
      renderBench: ({ props }) => h(GridBench, {}, h('pre', {}, JSON.stringify(props, null, 2))),
      renderTools: ({ props, setProps }) => h(TabbedToolbox, { tabs: {
        'Props': h(JSONEditorInput, { label: 'JSON Props', value: props, onValueChange: setProps }),
      }}),
    })
  ],
  children: []
};
const pageB = {
  ...pageA,
  type: 'pageB',
  name: 'pageB',
};
const pageC = {
  ...pageA,
  type: 'pageC',
  name: 'pageC',
  children: [pageB],
};
const rootPage = {
  href: '/',
  name: 'readme',
  content: [
    h(ReadmePageContent, { url: previewMd })
  ],
  children: [pageA, pageB, pageC],
};

export const PreviewApp/*: Component<PreviewAppProps>*/ = ({ title, root }) => {
  const [selectedPage, setSelectedPage] = useState(root);

  //const [workspaceProps, setWorkspaceProps] = useStorageState("wildspace_book_props", selectedPage ? selectedPage.defaultWorkplaceProps : {});

  return [
    h('div', { style: { position: 'absolute', height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}, [
      h('header', { style: { width: '100%' }}, h('h1', { className: styles.previewAppTitle }, title)),
      h('div', { style: { flexGrow: 1, display: 'flex', flexDirection: 'row' }}, [
        h(PageNavigation, { rootPage: root, onPageClick: setSelectedPage, selectedPage }),
        h('main', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column', height: 0, minHeight: '100%', width: 0, overflow: 'auto' }}, [
          selectedPage ? selectedPage.content : null
        ])
      ]),
    ]),
  ]
};

export * from './bench/grid.js';
export * from './tools/json.js';
export * from './tools/tabs.js';
export * from './page.js';
export * from './readmePageContent.js';
export * from './workspacePageContent.js';
export * from './markdown.js';