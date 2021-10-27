// @flow strict
/*:: import type { ElementNode, Component } from "@lukekaalim/act"; */
import { h, useState } from '@lukekaalim/act';
import previewStyles from './previewStyles.module.css';

/*::
export type Page = {
  name: string,
  href: string,
  content: ElementNode,
  children: Page[]
};
*/

const isDescendantSelected = (page, selectedPage) => {
  if (page === selectedPage)
    return true;
  return !!page.children.find(p => isDescendantSelected(p, selectedPage));
}

export const PageListElement/*: Component<{ page: Page, selectedPage: ?Page, onPageClick: Page => mixed }>*/ = ({ page, selectedPage, onPageClick }) => {
  const [open, setOpen] = useState(isDescendantSelected(page, selectedPage));
  const pageNameElement = [
    h('div', { className: previewStyles.background }),
    h('a', { href: page.href, onClick: (e) => {
      e.preventDefault();
      onPageClick(page);
     } }, page.name),
  ];
  const selected = page === selectedPage;
  const liClassName =  [selected && previewStyles.selected].filter(Boolean).join(',');

  if (page.children.length === 0)
    return h('li', { className: liClassName }, pageNameElement)

  return h('li', { className: liClassName }, h('details', { open: open, onToggle: e => setOpen(!!e.target.open) }, [
    h('summary', {}, pageNameElement),
    h('menu', {}, page.children.map(page => h(PageListElement, { page, selectedPage, onPageClick })))
  ]));
};

export const PageNavigation/*: Component<{ rootPage: Page, selectedPage: ?Page, onPageClick: Page => mixed }>*/ = ({ rootPage, selectedPage, onPageClick }) => {
  return (
    h('nav', { className: previewStyles.pageNavigation },
      h('menu', {},
        h(PageListElement, { page: rootPage, selectedPage, onPageClick })
      )
    )
  );
};
