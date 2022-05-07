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
    title: 'the black hand',
    type: 'gauntlet',
    description: `
The dark fires of the infernal realm forged this gauntlet, dripping with malice.

### Special Abilities
 - It can hold ice cream cones, and they won't drip on the user when they melt.

`,
    rarity: 'common',
    requiresAttunement: false,
  };

  return h(LayoutDemo, {}, h('div', { style: { padding: '24px' }}, h(MagicItemCard, { magicItem })));
};