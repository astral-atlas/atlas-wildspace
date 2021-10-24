// @flow strict
/*:: import type { Component, SetValue, ElementNode } from '@lukekaalim/act'; */
import { h, useState, useMemo } from '@lukekaalim/act';
import styles from './previewStyles.module.css';

/*::
export type PreviewPage<T: { ... }> = {
  name: ElementNode,
  defaultWorkplaceProps: T,
  workspaceControls: Component<{ workspaceProps: T, onWorkspacePropsChange: SetValue<T> }>,
  workspace: Component<T>,
};
export type PreviewAppProps = {|
  title: ElementNode,
  pages: PreviewPage<any>[],
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

export const PreviewApp/*: Component<PreviewAppProps>*/ = ({ title, pages }) => {
  const [selectedPageIndex, setSelectedPageIndex] = useStorageState("wildspace_book_index", -1);

  const selectedPage = pages[selectedPageIndex];
  const [workspaceProps, setWorkspaceProps] = useStorageState("wildspace_book_props", selectedPage ? selectedPage.defaultWorkplaceProps : {});

  return [
    h('div', { style: { position: 'absolute', height: '100%', width: '100%', display: 'flex', flexDirection: 'column' }}, [
      h('header', { style: { width: '100%' }}, h('h1', { className: styles.previewAppTitle }, title)),
      h('div', { style: { flexGrow: 1, display: 'flex', flexDirection: 'row' }}, [
        h(PreviewNavigation, { pages, selectedPageIndex, onPageClick: (p, i) => (setSelectedPageIndex(i), setWorkspaceProps(pages[i].defaultWorkplaceProps)) }),
        selectedPage ? h('main', { style: { flexGrow: 1, display: 'flex', flexDirection: 'column', height: 0, minHeight: '100%', width: 0 }}, [
          h(PreviewWorkspace, { selectedPage, workspaceProps }),
          h(PreviewControls, { selectedPage, setWorkspaceProps, workspaceProps }),
        ]) : h('main', {}, h('p', {}, `Select a page to get started.`)),
      ]),
    ]),
  ]
};

/*::
export type PreviewNavigationProps = {|
  pages: PreviewPage<{ ... }>[],
  selectedPageIndex: number,
  onPageClick: (PreviewPage<{ ... }>, number) => mixed
|};
*/
export const PreviewNavigation/*: Component<PreviewNavigationProps>*/ = ({ selectedPageIndex, pages, onPageClick }) => {
  return [
    h('nav', { style: { height: '100%', maxWidth: '250px', backgroundColor: '#eeae80' } }, [
      h('menu', { style: { listStyle: 'none', margin: 0, padding: 0, display: 'flex', flexDirection: 'column', border: '1px solid black' } }, [
        ...pages.map((page, i) =>
          h('li', { },
            h('button', {
              style: {
                borderRadius: 0,
                width: '100%',
                border: 0,
                height: '100%',
                display: 'block',
                overflow: 'auto',
                transition: 'box-shadow 0.2s',
                boxSizing: 'border-box',
              },
              disabled: selectedPageIndex === i,
              onClick: () => onPageClick(page, i)
            }, page.name)))
      ]),
    ]),
  ];
};

const PreviewControls = ({ selectedPage, workspaceProps, setWorkspaceProps }) => {
  return [
    h('div', { style: {
      height: '50%',
      width: '100%',
      maxHeight: '50%',
      border: '2px ridge',
      boxSizing: 'border-box',
      flexShrink: 0,
      overflow: 'scroll'
    } }, [
      h(selectedPage.workspaceControls, { workspaceProps, onWorkspacePropsChange: setWorkspaceProps })
    ]),
  ];
};

const PreviewWorkspace = ({ selectedPage, workspaceProps }) => {
  return [
    h('div', { style: { height: '50%', maxHeight: '50%', width: '100%', overflow: 'scroll', flexGrow: 0, boxSizing: 'border-box', position: 'relative' } }, [
      h('div', { style: { position: 'absolute', height: '100%', width: '100%', pointerEvents: 'none', boxSizing: 'border-box', overflow: 'hidden' } }, [
        h('svg', { width: '100%', height: '100%' }, [
          h('defs', {}, [
            h("pattern", {
              id: 'polka-dots',
              x: '0',
              y: '0',
              height: '100',
              width: '100',
              patternUnits: 'userSpaceOnUse'
            }, [
              h('line', { x1: '0', y1: '0', x2: '100', y2: '0', stroke: 'black' }),
              h('line', { x1: '0', y1: '0', x2: '0', y2: '100', stroke: 'black' }),
              h('line', { x1: '0', y1: '50', x2: '100', y2: '50', stroke: '#0000001f' }),
              h('line', { x1: '50', y1: '0', x2: '50', y2: '100', stroke: '#0000001f' }),
            ])
          ]),
          h('rect', { x: '0', y: '0', width: '100%', height: '100%', fill: 'url(#polka-dots)'})
        ]),
      ]),
      h('div', { style: { padding: '50px', height: '100%', width: '100%', boxSizing: 'border-box', position: 'relative' } }, [
        h('div', { style: {
          resize: 'both',
          overflow: 'hidden',
          backgroundColor: 'rgba(255, 255, 255, 0.91)',
          border: '1px solid #0000001f',
          height: '100%',
          width: '100%',
          boxShadow: '#a4a2a2 0px 0px 20px 0px'
        }}, [
          h(selectedPage.workspace, workspaceProps)
        ]),
      ]),
    ]),
  ];
};