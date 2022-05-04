// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { LayoutDemo } from "../demo";
import { MagicItemCard } from "@astral-atlas/wildspace-components";
import { h } from "@lukekaalim/act";

export const MagicItemCardDemo/*: Component<>*/ = () => {
  const magicItem = {
    id: '0',
    title: 'The Black hand of Jermaggadon',
    type: 'gauntlet',
    description: `
A Magic Sword passed down from the ages.

#### Special Props
This sword has **three** charges.

`,
    rarity: 'common',
    requiresAttunement: false,
  };

  return h(LayoutDemo, {}, h('div', { style: { padding: '24px' }}, h(MagicItemCard, { magicItem })));
};