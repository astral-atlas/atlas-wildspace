// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { MagicItem } from "@astral-atlas/wildspace-models";
*/
import { h, useEffect, useRef } from "@lukekaalim/act";
import { MarkdownRenderer } from "@lukekaalim/act-markdown";
import {
  BannerDivider,
  CopperCoinDivider,
  FeatureDivider,
  SquareDivider,
} from "../dividers/box";

import styles from './MagicItem.module.css';
import { CopperAttributeTag } from "./AttributeTag";

/*::
export type MagicItemCardProps = {
  magicItem: MagicItem
};

*/

export const MagicItemCard/*: Component<MagicItemCardProps>*/ = ({ magicItem }) => {
  const rootRef = useRef/*:: <?HTMLElement>*/();

  const titleRef = useRef/*:: <?HTMLElement>*/();
  const contentRef = useRef/*:: <?HTMLElement>*/();

  useEffect(() => {
    const { current: title } = titleRef;
    const { current: content } = contentRef;
    if (!title || !content)
      return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const size = entry.contentBoxSize[0].blockSize;
        content.style.marginTop = `${size / 2}px`;
        content.style.padding = `${size / 2}px`;
      }
    });
    observer.observe(title);
    return () => observer.disconnect();
  }, [])

  return [
    h('div', { ref: rootRef, class: styles.magicItemRoot }, [
      h(SquareDivider, { ref: titleRef, class: styles.titleContainer }, h('h3', { class: styles.title }, magicItem.title)),
      h(FeatureDivider, { ref: contentRef, class: styles.contentBorder }, [
        h('div', { class: styles.description }, [
          h('div', { class: styles.descriptionContent }, [
            h(MarkdownRenderer, { markdownText: magicItem.description })
          ])
        ]),
        h(MagicItemCardAttributes, { magicItem, titleRef, rootRef, contentRef }),
      ]),
    ]),
  ];
};

const MagicItemCardAttributes = ({ magicItem, rootRef, contentRef, titleRef }) => {
  const attribtuesRef = useRef/*:: <?HTMLElement>*/();

  useEffect(() => {
    const { current: attributes } = attribtuesRef;
    const { current: root } = rootRef;
    const { current: content } = contentRef;
    const { current: title } = titleRef;
    if (!attributes || !root || !content || !title)
      return;
    const observer = new ResizeObserver(entries => {
      for (let entry of entries) {
        const width = entry.contentBoxSize[0].inlineSize;
        const height = entry.contentBoxSize[0].blockSize;
        
        attributes.style.right = `${-width + 64}px`;
        root.style.marginRight = `${width - 64}px`;
        content.style.minHeight = `${height}px`;
      }
    });
    observer.observe(attributes);
    return () => observer.disconnect();
  }, [])

  return h('ul', { class: styles.attributeColumn, ref:attribtuesRef }, [
    magicItem.type && h('li', {}, h(CopperAttributeTag, {
      classList: [styles.attribute],
      label: h('span', { class: styles.attributeLabel }, 'Type'),
      alignment: 'right'
    }, h('span', { class: styles.attributeValue }, magicItem.type))),
    magicItem.rarity && h('li', {}, h(CopperAttributeTag, {
      classList: [styles.attribute],
      label: h('span', { class: styles.attributeLabel }, 'Rarity'),
      alignment: 'right'
    }, h('span', { class: styles.attributeValue }, magicItem.rarity))),
    magicItem.requiresAttunement && h('li', {}, h(CopperAttributeTag, {
      classList: [styles.attribute],
      label: h('span', { class: styles.attributeLabel }, 'Requires'),
      alignment: 'right'
    }, h('span', { class: styles.attributeValue }, 'Attunement'))),
    
  ])
}
