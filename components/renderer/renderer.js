// @flow strict
/*::
import type { Element as ActElement } from "@lukekaalim/act";
import type { RenderResult } from "@lukekaalim/act-renderer-core";
*/

import { createNullRenderer } from '@lukekaalim/act-renderer-core';
import { createObject, createObjectRenderer, createSceneRenderer } from '@lukekaalim/act-three';
import { createWebRenderer, setNodeChildren } from '@lukekaalim/act-web';
import { createTree } from '@lukekaalim/act-reconciler';

import { CSS2DObject } from 'three/examples/jsm/renderers/CSS2DRenderer.js';
//import { setObjectProps } from "@lukekaalim/act-three";

const web = createWebRenderer(diff => {
  switch (diff.next.element.type) {
    case 'detached':
      diff.diffs.map(web.render);
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
    case 'scene':
      return [];
    default:
      return null;
  }
})

const css3d = createObjectRenderer(
  diff => (web.render(diff), []),
  () => new CSS2DObject(),
  (diff, parent) => {
    setObjectProps(diff, parent);
    if (parent instanceof CSS2DObject)
      setNodeChildren(diff, parent.element, web.getNodes(diff.next));
  }
);

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