// @flow strict
/*::
import type { Element as ActElement } from "@lukekaalim/act";
*/

import { createNullRenderer } from '@lukekaalim/act-renderer-core';
import { createObjectRenderer, createSceneRenderer } from '@lukekaalim/act-three';
import { createWebRenderer, setNodeChildren } from '@lukekaalim/act-web';
import { createTree } from '@lukekaalim/act-reconciler';

import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';

const detachedRenderer = {
  render: (diff) => {
    const nodes = diff.diffs.map(web.render).flat(1);
    return [];
  }
}
const web = createWebRenderer(diff => {
  switch (diff.next.element.type) {
    case 'detached':
      detachedRenderer.render(diff);
      return [];
    case 'scene':
      three.render(diff);
      return [];
    default:
      return web.render(diff);
  }
}, commit => {
  switch (commit.element.type) {
    case 'detached':
      return [];
    default:
      return null;
  }
})
const css3d = createObjectRenderer((diff, parent) => {
  if (parent instanceof CSS2DObject)
    setNodeChildren(diff, parent.element, web.render(diff));
  return []
}, () => new CSS2DObject());

const three = createObjectRenderer(diff => {
  switch (diff.next.element.type) {
    case 'css2dObject':
      return css3d.render(diff);
    default:
      return three.render(diff);
  }
})

export const render = (act/*: ActElement*/, dom/*: Element*/) => {

  const onDiff = (diff) => {
    const nodes = web.render(diff);
    setNodeChildren(diff, dom, nodes);
  }
  const options = {
    onDiff,
    scheduleWork: c => requestAnimationFrame(() => void c()),
    cancelWork: t => cancelAnimationFrame(t)
  }

  createTree(act, options);
}