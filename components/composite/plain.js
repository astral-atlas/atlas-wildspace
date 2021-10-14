// @flow strict
/*:: import type { Component, ElementNode } from '@lukekaalim/act'; */
/*:: import type { CharacterClass } from '@astral-atlas/wildspace-models'; */
import { h, useState } from '@lukekaalim/act';
import { PlainDivider } from '../dividers/box.js';
import { PlainNumberInput } from '../entry.js';
import { PlainTextInput } from "../inputs/text";


/*::
export type TableProps = {|
  style?: { ... },
  caption?: string,
  headings?: ElementNode[],
  rows?: ElementNode[][],
  widths?: (?string)[],
|};
*/

export const PlainTable/*: Component<TableProps>*/ = (props) => {
  const { caption = null, headings = [], rows = [], widths = [], style } = props;
  return [
    h('table', { style: { ...style, tableLayout: 'fixed' }}, [
      h('colgroup', {}, widths.map(width => h('col', { width }))),
      caption && h('caption', { style: { captionSide: 'bottom', textTransform: 'uppercase' } }, caption),
      h('thead', {}, [
        h('tr', { style: { textTransform: 'uppercase' }}, [
          ...headings.map(heading => h('th', {}, heading)),
        ])
      ]),
      h('tbody', {}, [
        ...rows.map(row => [
          h('tr', {}, [
            ...row.map(cell => h('td', {}, cell))
          ])
        ])
      ])
    ])
  ]
};

/*::
export type Weapon = {
  name: string,
  attackBonus: number,
  damage: string, 
};

export type WeaponTableProps = {|
  weapons?: Weapon[],
  disabled?: boolean,
  onWeaponAdd?: Weapon => mixed,
  onWeaponRemove?: (weapon: Weapon, index: number) => mixed,
  style?: { scale?: number, ... } 
|};
*/

export const WeaponTable/*: Component<WeaponTableProps>*/ = (props) => {
  const {
    style: { scale = 1.5, ...style } = {},
    weapons = [],
    onWeaponAdd = _ => {},
    onWeaponRemove = (_, __) => {},
    disabled = false,
  } = props;

  const [newWeapon, setNewWeapon] = useState/*:: <Weapon>*/({ name: '', attackBonus: 0, damage: '' })

  const onClickAddWeapon = () => {
    onWeaponAdd(newWeapon)
    setNewWeapon({ name: '', attackBonus: 0, damage: '' });
  };
  const onClickRemoveWeapon = (weapon, index) => {
    setNewWeapon(weapon);
    onWeaponRemove(weapon, index);
  }

  return h(PlainTable, {
    style,
    caption: 'Attacks and Spellcasting',
    widths: [null, '200px'],
    headings: ['Name', 'Attack Bonus', 'Damage/Type'],
    rows: [
      !disabled ? [
        h(PlainTextInput, { style: { scale }, value: newWeapon.name, onChange: name => setNewWeapon(w => ({ ...w, name })) }),
        h(PlainNumberInput, { style: { scale }, value: newWeapon.attackBonus, onChange: attackBonus => setNewWeapon(w => ({ ...w, attackBonus })) }),
        h(PlainTextInput, { style: { scale }, value: newWeapon.damage,onChange: damage => setNewWeapon(w => ({ ...w, damage })) }),
        h('button', { style: { width: '100%' }, disabled: newWeapon.name === '' || newWeapon.damage === '', onClick: () => onClickAddWeapon() }, '+')
      ] : null,
      ...weapons.map((weapon, index) => [
        h(PlainDivider, { style: { scale, fontStyle: 'italic' } }, [weapon.name]),
        h(PlainDivider, { style: { scale, fontStyle: 'italic' } }, [weapon.attackBonus]),
        h(PlainDivider, { style: { scale, fontStyle: 'italic' } }, [weapon.damage]),
        !disabled ? h('button', { style: { width: '100%' }, onClick: () => onClickRemoveWeapon(weapon, index) }, '-') : null,
      ])
    ].filter(Boolean)
  });
}

/*::
export type ClassLevelTableProps = {|
  style?: { scale: number, ... },
  levels?: $ReadOnlyArray<CharacterClass>,
  onLevelAdd?: (level: CharacterClass) => mixed,
  onLevelRemove?: (level: CharacterClass, index: number) => mixed,
  disabled?: number,
|};
*/

export const ClassLevelTable/*: Component<ClassLevelTableProps>*/ = (props) => {
  const {
    style: { scale = 1.5, ...style } = {},
    levels = [],
    onLevelAdd = _ => {},
    onLevelRemove = (_, __) => {},
    disabled = false,
  } = props;

  const [newLevel, setNewLevel] = useState/*:: <CharacterClass>*/({ class: '', subclass: null, count: 0 })

  const onClickAddLevel = () => {
    onLevelAdd(newLevel)
    setNewLevel({ class: '', subclass: null, count: 0 });
  };
  const onClickRemoveLevel = (level, index) => {
    setNewLevel(level);
    onLevelRemove(level, index);
  }

  return h(PlainTable, {
    caption: 'Class Levels',
    widths: ['100px'],
    headings: ['Levels', 'Class', 'Subclass'],
    rows: [
      !disabled ? [
        h(PlainNumberInput, { style: { scale }, min: 0, max: 20, value: newLevel.count, onChange: count => setNewLevel(w => ({ ...w, count })) }),
        h(PlainTextInput, { style: { scale }, value: newLevel.class, onChange: _class => setNewLevel(w => ({ ...w, class: _class })) }),
        h(PlainTextInput, { style: { scale }, value: newLevel.subclass || '', onChange: subclass => setNewLevel(w => ({ ...w, subclass: subclass ? subclass : null })) }),
        h('button', { style: { width: '100%' }, disabled: newLevel.class === '' || newLevel.count < 1, onClick: () => onClickAddLevel() }, '+')
      ] : null,
      ...levels.map((level, index) => [
        h(PlainDivider, { style: { scale, fontStyle: 'italic' } }, [level.count]),
        h(PlainDivider, { style: { scale, fontStyle: 'italic' } }, [level.class]),
        h(PlainDivider, { style: { scale, fontStyle: 'italic' } }, [level.subclass || '(No Subclass)']),
        !disabled ? h('button', { style: { width: '100%' }, onClick: () => onClickRemoveLevel(level, index) }, '-') : null,
      ])
    ].filter(Boolean)
  });
}