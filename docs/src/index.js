// @flow strict
/*:: import type { NavigationLink } from "@lukekaalim/act-rehersal"; */
/*:: import type { ElementNode } from "@lukekaalim/act"; */
import { Boundary, h, useState } from '@lukekaalim/act'; 
import { render } from '@astral-atlas/wildspace-components';
import { Document, Markdown, Rehersal } from '@lukekaalim/act-rehersal';
import { useRootNavigation, navigationContext } from '@lukekaalim/act-navigation';

import './index.module.css';

import wildspaceText from './index.md?raw';
import { layoutsPage, layoutsPages } from './pages/layouts';
import { scenesPage, scenesPages } from './scenes.js';
import { controlsPage, controlsPages } from "./controls";
import { geometryPage, geometryPages } from './geometry';
import { useEffect } from "@lukekaalim/act/hooks";
import { assetPage, assetPages } from './asset';
import { editorsPages, editorsPage } from './editors';
import { gmPage, gmPages } from "./gm";
import { paperPage, paperPages } from "./paper";
import { libraryPage, libraryPages } from "./library";
import { particlePage, particlePages } from "./particle";
import { initiativePage, initiativePages } from "./initiative";
import { toolbarPage, toolbarPages } from "./toolbar";
import { mainMenuPage, mainMenuPages } from "./mainMenu";
import { miniTheaterPage, miniTheaterPages } from './miniTheater/miniTheater';
import { snackbarPage, snackbarPages } from "./snackbar";
import { terrainEditorPage, terrainEditorPages } from "./terrainEditor";
import { renderPage, renderPages } from "./render";
import { magicItemPage, magicItemPages } from "./magicItem";

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
      assetPage.link,
      editorsPage.link,
      gmPage.link,
      paperPage.link,
      libraryPage.link,
      particlePage.link,
      initiativePage.link,
      toolbarPage.link,
      mainMenuPage.link,
      miniTheaterPage.link,
      snackbarPage.link,
      terrainEditorPage.link,
      renderPage.link,
      magicItemPage.link,
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
  ...assetPages,
  ...editorsPages,
  ...gmPages,
  ...paperPages,
  ...libraryPages,
  ...particlePages,
  ...initiativePages,
  ...toolbarPages,
  ...mainMenuPages,
  ...miniTheaterPages,
  ...snackbarPages,
  ...terrainEditorPages,
  ...renderPages,
  ...magicItemPages
];

const normalizeURLPathname = pathname =>
  pathname.split('/').filter(Boolean).join('/');

const App = () => {
  const navigation = useRootNavigation(document.location.href);
  
  const onLinkClick = (event, link) => {
    event.preventDefault();
    if (link.href)
      navigation.navigate(new URL(link.href, navigation.location));
  }

  const page = pages.find(p => {
    const url = new URL(p.link.href || '/', document.location.href);
    return normalizeURLPathname(url.pathname) === normalizeURLPathname(navigation.location.pathname);
  })

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

App.coolProperty = 'wha';

const main = () => {
  if (window.wildspace_loaded)
    return;
  window.wildspace_loaded = true
  const { body } = document;
  if (!body)
    return;

  render(h(App), body);
};

main();