// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
import { h } from '@lukekaalim/act';
import { CircleCheckboxInput } from '../entry.js';

import initiativeStyles from './initiative.module.css';

/*::
export type InitiativeTurnRowProps = {|
  turn: number,
  active?: bool,
  selected?: bool,
  name: string,
  iconURL: string,
  maxHitpoints: number,
  hitpoints: number,
  tempHitpoints: number,
  tags: string[],
  style?: { ... },
  className?: string,
  onClick?: void => mixed,
  onSelectedChange?: bool => mixed,
|};
*/

export const InitiativeTurnRow/*: Component<InitiativeTurnRowProps>*/ = ({
  name,
  maxHitpoints,
  active = false,
  hitpoints,
  selected = false,
  tempHitpoints,
  tags,
  turn,
  iconURL,
  style,
  className,
  onClick = _ => {},
  onSelectedChange = _ => {},
}) => {
  const rowClassNames = [
    initiativeStyles.turn,
    className,
  ].filter(Boolean).join(' ');

  return h('tr', { className: rowClassNames, style, onClick }, [
    h('td', {},
      h('label', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center', height: '64px', width: '64px' }},
        h(CircleCheckboxInput, { value: selected, onChange: onSelectedChange }))),
    h('td', {}, h('span', {}, active ? `${turn} (Active)` : turn.toString())),
    h('td', {}, h('div', { className: initiativeStyles.name, style: { height: '100%' }}, [
      h('span', { style: { flex: '1' }}, name)]
    )),
    h('td', {}, h('div', { className: initiativeStyles.icon }, [
      iconURL && h('img', { src: iconURL, height: '64', width: '64', style: { } }),
    ])),
    h('td', {}, [
      h('span', {}, hitpoints),
      tempHitpoints !== 0 ? h('span', {}, [` + `, tempHitpoints]) : null,
      h('span', {}, [` / `, maxHitpoints]),
    ]),
    h('td', {}, h('span', {}, [
      ...tags.map(tag => h('span', { style: { backgroundColor: '#b76d0e', padding: '2px 8px 2px 8px', color: 'white', margin: '0 4px 0 4px' } }, tag))
    ]))
  ]);
};
