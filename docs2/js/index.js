// @flow strict

import { h, useState } from "@lukekaalim/act";
import { render } from "@lukekaalim/act-three";
import { RehersalApp } from '@lukekaalim/act-rehersal/rehersal2';
import styles from './index.module.css';
import { MarkdownBlock } from "@lukekaalim/act-rehersal/rehersal2/components/MarkdownBlock";
import { TextBlock } from "@lukekaalim/act-rehersal/rehersal2/components/TextBlock";
/*::
import type { RehersalPage } from "@lukekaalim/act-rehersal/rehersal2/pages";
*/
import { directives } from "./directives";
import { useAsync } from "@astral-atlas/wildspace-components";


const Docs = ({ pages }) => {
  return h('div', { class: styles.docs },
    h(RehersalApp, { pages }))
}

const IndexPage = ({ path, childPaths }) => {
  return [
    h(TextBlock, {}, [
      h('h1', {}, `${path} Index`),
      h('ol', {}, childPaths.map(path => {
        const parts = path.split('/');
        return h('li', {}, h('a', { href: `/${path}` }, parts[parts.length - 1] ))
      }))
    ])
  ]
}
const MarkdownPage = ({ markdownTextURL }) => {
  // $FlowIgnore
  const [markdownText] = useAsync(async () => markdownTextURL(), [])
  if (!markdownText)
    return null;
  return h(MarkdownBlock, { input: { type: 'text', text: markdownText }, directives });
}

const main = async () => {
  const { body } = document;

  // $FlowFixMe
  const markdownURLs = import.meta.glob('./**/*.md', { as: 'raw' }); // */);

  const allPaths = [...new Set(Object.keys(markdownURLs)
    .map(pagePath => {
      const pagePathParts = pagePath
        .split('/')
        .slice(2)
        .filter(p => p !== '.' && !!p)
      return Array.from({ length: pagePathParts.length }).map((_, index) => {
        const [path, extension] = pagePathParts.slice(0, index + 1).join('/').split('.');
        return path;
      })
    })
    .flat()
  )];
  
  const findChildPaths = (path, allPaths) => {
    const pathParts = path.split('/').filter(Boolean);
    const childPaths = allPaths
      .filter(p =>
        p.startsWith(path)
        && p !== path
        && p.split('/').length - 1 === pathParts.length);
    return childPaths;
  }

  const buildPageFromPath = (path, allPaths)/*: RehersalPage*/ => {
    const pathParts = path.split('/');
    const id = pathParts[pathParts.length - 1];
    const childPaths = findChildPaths(path, allPaths);

    const markdownTextURL =
      markdownURLs['./home/' + path + '.md']
      || markdownURLs['./home/' + path + '/index.md']

    const content = markdownTextURL
      ? h(MarkdownPage, { markdownTextURL })
      : h(IndexPage, { path, childPaths });

    const page = {
      id: path,
      path: '/' + path.toLocaleLowerCase(),
      title: id,
      content,
      children: childPaths.map(childPath => buildPageFromPath(childPath, allPaths)),
      subsections: [],
    };
    return page;
  }
  
  const homePage = {
    id: 'home',
    path: '/',
    title: 'Home',
    content: h(MarkdownPage, { markdownTextURL: markdownURLs['./home.md'] }),
    children: findChildPaths('', allPaths)
      .map(childPath => buildPageFromPath(childPath, allPaths)),
    subsections: [],
  };
  console.log(homePage)

  body && render(h(Docs, { pages: [homePage] }), body)
};

main()