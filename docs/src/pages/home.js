// @flow strict
/*::
import type { RehersalPage } from "@lukekaalim/act-rehersal/rehersal2";
*/

import { createId, h } from "@lukekaalim/act";
import { MarkdownBlock } from "@lukekaalim/act-rehersal/rehersal2/components/MarkdownBlock";
import text from './home.md?raw';

const page = (title, content = '', ...children) => ({
  id: createId(),
  path: `/${title}`,
  title,
  content,
  children: children.map(c => ({ ...c, path: `/${title}${c.path}`})),
  subsections: [],
});

export const homePage/*: RehersalPage*/ = {
  path: '/',
  title: "Home",
  id: 'home',
  content: h(MarkdownBlock, { input: { type: 'text', text } }),
  subsections: [],
  children: [
    page('Components', h(MarkdownBlock, { input: { type: 'text', text: '# Components'}}),
      page('Interface', ''), page('Layout', ''), page('Composite', '')),
    page('Site', '',
     page('Controllers'), page('Pages')),
    page('API', '',
      page('Routes'), page('Data')),
    page('Client'),
  ],
}