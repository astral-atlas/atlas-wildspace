// @flow strict
import { h, useState } from '@lukekaalim/act';
import { render } from '@lukekaalim/act-web';
/*:: import type { Weapon } from '@astral-atlas/wildspace-components'; */ 
/*:: import type { CharacterClass } from '@astral-atlas/wildspace-models'; */ 
import {
  InspirationInput, PassiveInput, ProficencyInput,
  ArmorInput, BeveledDivider, BrandedTextInput, BannerDivider,
  SquareDivider, PlainDivider, SkillSaveDivider, HealthDivider,
  WeaponTable,
  ClassLevelTable,
  FeatureDivider,
  SegmentedTop
} from '@astral-atlas/wildspace-components';

import bookStyles from './book.module.css';

const WildspaceBook = () => {
  const [scale, setScale] = useState(1.5);
  const [fontSize, setFontSize] = useState(16);
  const [weapons, setWeapons] = useState/*:: <Weapon[]>*/([{ name: 'Battleaxe', attackBonus: 4, damage: '1d8 + 2 Slashing Damage' }]);
  const [levels, setLevels] = useState/*:: <CharacterClass[]>*/([{ class: 'Rogue', count: 2, subclass: 'Thief' }]);

  const label = h('span', {}, ['ohoo, ', h('strong', {}, 'powerful'), ' you are']);

  return [
    h('h1', {} , 'Wildspace Book'),
    h('input', { type: 'range', min: 1, max: 5, step: 0.01, value: scale, onInput: e => setScale(e.target.valueAsNumber) }),
    h('input', { type: 'range', min: 10, max: 30, step: 0.01, value: fontSize, onInput: e => setFontSize(e.target.valueAsNumber) }),
    h('section', { style: { fontSize: `${fontSize}px` }, className: bookStyles.componentList }, [
      h(InspirationInput, { label: 'Inspiration', value: 1, min: 0, max: 10, style: { scale } }),
      h(ProficencyInput, { label: 'Proficency', value: 1, min: 0, max: 10, style: { scale }}),
      h(PassiveInput, { label: 'Passive Perception', value: 1, min: 0, max: 10, style: { scale }}),
      h(ArmorInput, { label: "Armor Class", value: 1, min: 0, max: 10, style: { scale }}),
      h(BrandedTextInput, { style: { scale }, value: 'aaaaaaaaaaaa' }),
      h(BeveledDivider, { style: { scale, width: 'min-content', resize: 'both', overflow: 'hidden' } }),
      h(BannerDivider, { style: { scale, width: 'min-content', resize: 'both', overflow: 'hidden' } }),
      h(SquareDivider, { style: { scale, width: 'min-content', resize: 'both', overflow: 'hidden' } }),
      h(PlainDivider, { style: { scale, width: 'min-content', resize: 'both', overflow: 'hidden' } }),
      h(SkillSaveDivider, { style: { scale, width: 'min-content', resize: 'both', overflow: 'hidden' } }),
      h(HealthDivider, { style: { scale, width: 'min-content', resize: 'both', overflow: 'hidden' } }),
      h(WeaponTable, { style: { scale },
        onWeaponAdd: wa => setWeapons(ws => [wa, ...ws]),
        onWeaponRemove: wr => setWeapons(ws => ws.filter(w => w !== wr)),
        weapons
      }),
      h(FeatureDivider, { style: { scale } }, [
        h(ClassLevelTable, { style: { scale },
          onLevelAdd: la => setLevels(ls => [la, ...ls]),
          onLevelRemove: lr => setLevels(ls => ls.filter(l => l !== lr)),
          levels
        }),
      ]),
      h(SegmentedTop, { style: { scale, width: 'min-content', resize: 'both', overflow: 'hidden' }  })
    ]),
  ]
};

const main = () => {
  const { body } = document;
  if (!body)
    throw new Error();

  setTimeout(() => {
    render(h(WildspaceBook), body);
  }, 50);
};

main();