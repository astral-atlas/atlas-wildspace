// @flow strict
/*:: import type { NavigationLink } from "@lukekaalim/act-rehersal"; */
/*:: import type { ElementNode } from "@lukekaalim/act"; */
import { h } from '@lukekaalim/act'; 
import { render } from '@lukekaalim/act-three';
import { Document, Markdown, Rehersal } from '@lukekaalim/act-rehersal';
import { useRootNavigation, navigationContext } from '@lukekaalim/act-navigation';

import './index.module.css';

import wildspaceText from './index.md?raw';
import { layoutsPage, layoutsPages } from './pages/layouts';
import { scenesPage, scenesPages } from './scenes.js';
import { controlsPage, controlsPages } from "./controls";
import { geometryPage, geometryPages } from './geometry';
import { useEffect } from "@lukekaalim/act/hooks";
import { audioPage, audioPages } from './audio';

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
    children: [
      layoutsPage.link,
      scenesPage.link,
      controlsPage.link,
      geometryPage.link,
      audioPage.link,
    ],
    href: '/',
  }
}

const pages = [
  rootPage,
  ...scenesPages,
  ...layoutsPages,
  ...controlsPages,
  ...geometryPages,
  ...audioPages,
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
  
  const onClick = (e) => {
    const anchor = e.composedPath().find(e => e.tagName === 'A');
    if (!e.defaultPrevented && anchor && anchor.href) {
      const url = new URL(anchor.href);
      if (url.origin !== document.location.origin)
        return;
      e.preventDefault();
      if (navigation.location.href === url.href) {
        if (!url.hash)
          return;
        const target = document.getElementById(url.hash.substring(1));
        if (!target)
          return;
        target.scrollIntoView({ behavior: 'smooth' });
      }
      navigation.navigate(url)
    }
  };

  useEffect(() => {
    if (!navigation.location.hash)
      return;
    const target = document.getElementById(navigation.location.hash.substring(1));
    if (!target)
      return;
    target.scrollIntoView({ behavior: 'smooth' });
  }, [navigation.location.hash])

  return h(navigationContext.Provider, { value: navigation },
      h(Rehersal, { rootLink: rootPage.link, selectedLink: page.link, onLinkClick },
         h('div', { onClick },
          page.content)));
};

const main = () => {
  const { body } = document;
  if (body)
    render(h(App), body);
};

main();