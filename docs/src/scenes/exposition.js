// @flow strict
/*:: import type { MarkdownASTNode } from '@lukekaalim/act-markdown'; */
/*:: import type { Component } from '@lukekaalim/act'; */
import { h } from "@lukekaalim/act";
import { MarkdownASTRenderer } from "@lukekaalim/act-markdown";

import styles from './exposition.module.css';
import { useAnimatedList } from "@lukekaalim/act-curve";
import { useRef, useState } from "@lukekaalim/act";
import { maxSpan, useTimeSpan } from "@lukekaalim/act-curve";
import { calculateCubicBezierAnimationPoint } from "@lukekaalim/act-curve/bezier";
import { defaultBezierElementOptions } from "@lukekaalim/act-curve/array";
import { useMemo } from "@lukekaalim/act/hooks";

/*::
export type Scene =
  | LocationExpositionScene

export type LocationExpositionScene = {
  type: 'location',
  name: string,
  location: ?LocationExposition,
};

export type ImageGraphic = {
  type: 'image',
  source: string,
  alternativeText: string,
}
export type ColorGraphic = {
  type: 'color',
  color: string,
}

export type Graphic =
  | ImageGraphic
  | ColorGraphic

export type LocationExposition = {
  content: string | MarkdownASTNode,
  background: Graphic
};
*/

export const SceneRenderer/*: Component<{ scene: Scene }>*/ = ({ scene }) => {
  switch (scene.type) {
    case 'location':
      return h(LocationExpositionRenderer, { exposition: scene.location });
    default:
      throw new Error(`Unknown scene type`);
  }
};

const useMapRef = /*:: <K, V>*/()/*: [Map<K, V>, K => V => void]*/ => {
  const [map] = useState(new Map());
  const setRef = (key) => (value) => {
    if (value === null)
      map.delete(key);
    else
      map.set(key, value);
  };
  return [map, setRef];
}

export const LocationExpositionRenderer/*: Component<{ exposition: ?LocationExposition }>*/ = ({
  exposition
}) => {
  const uniqueExposition = useMemo(() => exposition && ({ ...exposition }), [exposition])

  const [anims, filter] = useAnimatedList([uniqueExposition].filter(Boolean), [],
    { ...defaultBezierElementOptions, statusDurationMs: 1000, statusImpulse: 2 });

  const [map, setRef] = useMapRef/*:: <LocationExposition, HTMLElement>*/();
  const max = maxSpan(anims.map(a => [a.index.span, a.status.span]).flat(1));

  useTimeSpan(max, now => {
    for (const anim of anims) {
      const element = map.get(anim.value)
      const status = calculateCubicBezierAnimationPoint(anim.status, now);
      if (!element)
        continue;
    
      if (anim.status.shape[3] === 0)
        element.style.transform = `translate(${status.position * 1.2 * 100}%)`;
      element.style.opacity = `${1 - Math.abs(Math.max(0, status.position))}`;
      element.style.zIndex = `${1 - Math.floor(status.position)}`;
    
      if (status.position === 1) {
        filter(a => a.value !== anim.value)
      }
    }
  }, [exposition]);

  return anims.map(anim => {
    return h('div', { key: anim.value, class: styles.scene, ref: setRef(anim.value) }, [
      h('div', { class: styles.background }, [
        anim.value.background.type === 'image' && h('img', { src: anim.value.background.source }),
        anim.value.background.type === 'color' && h('div', { class: styles.background, style: { backgroundColor: anim.value.background.color } }),
        h('div', { class: styles.overlay }),
      ]),
      h('article', { class: styles.content }, [
        typeof anim.value.content === 'string'
          ? anim.value.content
          : h(MarkdownASTRenderer, { root: anim.value.content })
      ]),
    ])
  });
};
