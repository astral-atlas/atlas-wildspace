// @flow strict
/*:: import type { NavigationLink } from "@lukekaalim/act-rehersal"; */
/*:: import type { ElementNode } from "@lukekaalim/act"; */
import { h } from '@lukekaalim/act'; 
import { render } from '@lukekaalim/act-three';
import { Document, Markdown, Rehersal } from '@lukekaalim/act-rehersal';
import { useRootNavigation, navigationContext } from '@lukekaalim/act-navigation';

import wildspaceText from './wildspace.md?raw';
import { componentPage, componentsPages } from './componentPages';

/*::
export type Page = {
  content: ElementNode,
  link: NavigationLink,
};
*/
 
const rootPage = {
  content: [
    h(Document, {}, [
      h(Markdown, { text: wildspaceText })
    ]),
  ],
  link: {
    name: 'Wildspace',
    children: [componentPage.link],
    href: '/',
  }
}

const pages = [
  rootPage,
  ...componentsPages,
];

const App = () => {
  const navigation = useRootNavigation(document.location.href);
  
  const onLinkClick = (event, link) => {
    event.preventDefault();
    if (link.href)
      navigation.navigate(new URL(link.href, navigation.location));
  }

  const page = pages.find(p => p.link.href === navigation.location.pathname)

  if (!page)
    return null;

  return h(navigationContext.Provider, { value: navigation },
      h(Rehersal, { rootLink: rootPage.link, selectedLink: page.link, onLinkClick }, page.content));
};

const main = () => {
  const { body } = document;
  if (body)
    render(h(App), body);
};

main();