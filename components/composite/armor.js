// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
/*:: import type { CharacterACBonus } from '@astral-atlas/wildspace-models'; */
import { h, useState, useEffect, useRef } from '@lukekaalim/act';
import { PlainDivider } from '../dividers/box.js';
import { ArmorInput, PlainNumberInput } from '../entry.js';
import { PlainTextInput } from "../inputs/text";

/*::
export type ArmorCalculatorProps = {|
  baseAC: number,
  baseACReason: string,
  bonuses: $ReadOnlyArray<CharacterACBonus>
|};
*/

const armorDatalist = h('datalist', { id: `wildspace_base_ac_reasons` }, [
  h('option', { value: 'Unarmored' }),
  h('option', { value: 'Unarmored Defense' }),
  h('option', { value: 'Natural Armor' }),
  h('option', { value: 'Leather Armor' }),
  h('option', { value: 'Padded Armor' }),
  h('option', { value: 'Studded Leather Armor' }),
  h('option', { value: 'Hide Armor' }),
  h('option', { value: 'Chain Shirt Armor' }),
  h('option', { value: 'Scale Mail Armor' }),
  h('option', { value: 'Breastplate Armor' }),
  h('option', { value: 'Half Plate Armor' }),
  h('option', { value: 'Half Plate Armor' }),
  h('option', { value: 'Ring Mail Armor' }),
  h('option', { value: 'Chain Mail Armor' }),
  h('option', { value: 'Splint Armor' }),
  h('option', { value: 'Plate Armor' }),
]);
const armorBonusDatalist = h('datalist', { id: `wildspace_bonus_ac_reasons` }, [
  h('option', { value: 'Shield' }),
  h('option', { value: 'Unarmored Defense' }),
]);

export const ArmorCalculator/*: Component<ArmorCalculatorProps>*/ = ({ baseAC, baseACReason, bonuses }) => {
  const reasonInputRef = useRef/*:: <?HTMLInputElement>*/();
  useEffect(() => {
    const { current: input } = reasonInputRef;
    if (!input)
      return;
    input.setAttribute('list', `wildspace_base_ac_reasons`);
  }, [])

  return h('div', { style: { display: 'flex', flexDirection: 'row' }}, [
    h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, [
      h(ArmorInput, {
        label: h('span', { style: { textTransform: 'uppercase', fontSize: '14px', fontWeight: 'bold' }}, `Armor Class`),
        value: baseAC
      }),
      armorDatalist,
      h('label', { style: { width: '240px', display: 'inline-block', textAlign: 'center' }}, [
        h('span', { style: { color: '#959393', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}, 'Base Armor Class'),
        h(PlainTextInput, { ref: reasonInputRef, value: baseACReason, style: { textAlign: 'center' } }),
      ]),
    ]),
    h('div', { style: { display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '120px' }}, [
      h('pre', { style: { fontSize: '32px' } }, '+')
    ]),
    h('div', { style: { display: 'flex', flexDirection: 'column', alignItems: 'center' } }, [
      h('div', { style: { height: '120px', padding: '30px', boxSizing: 'border-box', display: 'flex', flexDirection: 'column' } }, [
        h(PlainNumberInput, { value: 0, style: { textAlign: 'center', height: '100%', width: '80px' } }),
      ]),
      armorBonusDatalist,
      h('label', { style: { width: '240px', display: 'inline-block', textAlign: 'center' }}, [
        h('span', { style: { color: '#959393', fontSize: '14px', textTransform: 'uppercase', fontWeight: 'bold' }}, 'Armor Class Bonus'),
        h(PlainTextInput, { value: '', style: { textAlign: 'center' } }),
      ]),
    ])
  ]);
};