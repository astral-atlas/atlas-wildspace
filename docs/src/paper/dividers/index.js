// @flow strict
/*::
import type { Page } from "../..";
*/

import { h } from '@lukekaalim/act';
import { Document, Markdown } from "@lukekaalim/act-rehersal";
import {
  PlainDivider,
  SquareDivider,
  FeatureDivider,
  SkillSaveDivider,
  BannerDivider,
  BeveledDivider,
  HealthDivider,
  SegmentedTop,
  SegmentedMiddle,
  SegmentedBottom,
  CopperCoinDivider,
  CoinLabelDivider,
} from '@astral-atlas/wildspace-components';

import text from './index.md?raw';

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'square':
      return h(SquareDivider, {}, 'Content')
    case 'banner':
      return h(BannerDivider, {}, 'Content')
    case 'health':
      return h(HealthDivider, {}, 'Content')
    case 'beveled':
      return h(BeveledDivider, {}, 'Content')
    case 'plain':
      return h(PlainDivider, {}, 'Content')
    case 'feature':
      return h(FeatureDivider, {}, 'Content')
    case 'skill':
      return h(SkillSaveDivider, {}, 'Content')
    case 'copper':
      return h(CopperCoinDivider, {}, 'Content')
    case 'coin_label':
      return h(CoinLabelDivider, {}, 'Content')
    case 'segmented_top':
      return h(SegmentedTop, {}, 'Content')
    case 'segmented_middle':
      return h(SegmentedMiddle, {}, 'Content')
    case 'segmented_bottom':
      return h(SegmentedBottom, {}, 'Content')
  }
  throw new Error();
}

const directives = {
  demo: Demo
}

export const paperDividersPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text, directives })),
  link: { children: [], name: 'Dividers', href: '/paper/dividers' }
};
