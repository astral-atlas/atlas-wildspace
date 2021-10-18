// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
/*:: import type { CharacterMini, Character, Monster, Encounter, EncounterState, MiniID } from '@astral-atlas/wildspace-models'; */
import { h } from '@lukekaalim/act';
import { SquareDivider } from '../entry.js';

import initiativeStyles from './initiative.module.css';
import { InitiativeTurnRow } from "./turn";

/*::
export type InitiativeRoundTableProps = {|
  roundName: ElementNode,
  className?: string,
|};
*/

export const InitiativeRoundTable/*: Component<InitiativeRoundTableProps>*/ = ({ roundName, children, className }) => {
  return [
    h(SquareDivider, { style: { height: '100%', boxSizing: 'border-box' }, className }, [
      h('div', { style: { height: '100%', overflow: 'auto' }}, [
        h('table', { className: initiativeStyles.round }, [
          h('colgroup', {}, ['64px', '64px', '200px', '64px', '200px'].map(width => h('col', { width }))),
          h('caption', {}, roundName),
          h('thead', {}, [
            h('tr', {}, [
              h('th', {}, ''),
              h('th', {}, 'Turn'),
              h('th', { colSpan: 2 }, 'Character'),
              h('th', {}, 'Hitpoints'),
              h('th', {}, 'Tags'),
            ])
          ]),
          h('tbody', {}, [
            children,
          ]),
        ]),
      ])
    ])
  ]
};