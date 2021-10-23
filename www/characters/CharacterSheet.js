// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { UserID, LinkProof } from '@astral-atlas/sesame-models'; */
/*:: import type { Game, Player, Character, CharacterID } from '@astral-atlas/wildspace-models'; */
import { h, useState, useEffect, useMemo } from '@lukekaalim/act';
import { C } from '@lukekaalim/act-three';

import { renderAppPage } from "../app.js";
import { CopperButton, FeatureSection, SmallTextInput } from '../components/5e.js';
import { useAPI } from "../hooks/api.js";
import { useAsync } from '../hooks/async.js';
import { useIdentity } from '../hooks/identity.js';
import { BackgroundBox, WordInput } from "../components/5e.js";

import styles from './characters.module.css';
import { WildspaceHeader } from '../components/Header.js';
import { StarfieldScene } from './starfieldScene.js';
import { useNavigation, useURLParam } from '../hooks/navigation.js';
import { useConnection } from "../hooks/connect";

/*::
export type CharacterSheetProps = {
  game: Game,
  identity: { proof: LinkProof },
  player: Player,
  character: Character,
  readOnly?: boolean,
};
*/

const PronounEditor = ({ pronouns, onPronounChange, disabled }) => {
  const onEnableChange = (e) => {
    const { checked } = e.target;
    onPronounChange(checked ? { enabled: true, object: '', possessive: '' } : { enabled: false });
  };
  const onPossessiveChange = (possessive) => {
    if (!pronouns.enabled)
      return;
    onPronounChange({ ...pronouns, possessive });
  };
  const onObjectChange = (object) => {
    if (!pronouns.enabled)
      return;
    onPronounChange({ ...pronouns, object });
  };

  return [
    h('div', { className: styles.characterSheetStack }, [
      h('label', { className: styles.characterSheetLabelText }, [
        h('input', { type: 'checkbox', checked: pronouns.enabled, onChange: onEnableChange, disabled }),
        h('span', {}, 'Enable Pronouns'),
      ]),
      h('div', { style: { display: 'flex', flexDirection: 'row' }, className: [
        styles.characterSheetOptional,
        !pronouns.enabled && styles.characterSheetOptionalDisabled
      ].join(' ') }, [
        pronouns.enabled ? [
          h(WordInput, {
            label: `Possessive`,
            value: pronouns.possessive,
            disabled,
            onChange: onPossessiveChange, placeholder: `e.g. She, He` }),
          h(WordInput, {
            label: `Object`,
            value: pronouns.object,
            disabled,
            onChange: onObjectChange, placeholder: `e.g. Her, His` })
        ] : [
          h(WordInput, { label: `Possessive`, value: '', disabled: true, placeholder: `e.g. She, He` }),
          h(WordInput, { label: `Object`, value: '', disabled: true, placeholder: `e.g. Her, His` }),
        ]
      ]),
    ]),
  ]
};

const LongTextArea = ({ text, onTextChange, disabled }) => {
  const onChange = (e) => {
    onTextChange(e.target.value);
  };
  return [
    h('label', { className: styles.characterSheetLongTextArea }, [
      h('span', { className: styles.characterSheetLabelText }, disabled ? `🔒 Background Description` : `Background Description`),
      h('textarea', {
        className: styles.characterSheetLongTextAreaInput,
        style: { display: 'inline' },
        placeholder: `A balding late/middle-aged dward, Torpus is a peddler of all sorts of wares as he travels through the lands.`,
        onChange,
        value: text,
        disabled,
      }),
    ])
  ]
};

const SmallNumberEditor = ({ label, value, onNumberChange, disabled }) => {
  const onChange = (e) => {
    onNumberChange(e.target.valueAsNumber);
  }
  console.log(label, value);
  return [
    h('label', { className: [styles.characterSheetSmallNumber, label && styles.labeled].join(' ') }, [
      label && h('span', { className: styles.characterSheetLabelText }, label),
      h('input', { type: 'number', min: 0, max: 20, className: styles.characterSheetSmallNumberInput, value, onChange, disabled }),
    ]),
  ]
};

const ClassLevelEditorRow = ({ level, onLevelChange, includeLabel, disabled = false }) => {
  const onCountChange = (count) => {
    onLevelChange({ ...level, count });
  };
  const onClassChange = (_class) => {
    onLevelChange({ ...level, class: _class });
  };
  const onSubclassChange = (subclass) => {
    onLevelChange({ ...level, subclass });
  };

  return [
    h('div', { style: { display: 'flex', flexDirection: 'row', justifyContent: 'flex-start' }}, [
      h(SmallNumberEditor, { onNumberChange: onCountChange, value: level.count, label: includeLabel ? 'Level' : null, disabled }),
      h(WordInput, { onChange: onClassChange, label: includeLabel ? `Class` : null, value: level.class, placeholder: `Cleric`, disabled }),
      h(WordInput, { onChange: onSubclassChange, label: includeLabel ? `Subclass` : null, value: level.subclass || '', placeholder: `Trickster`, disabled }),
      !includeLabel && h('button', { onClick: () => onLevelChange(null), disabled }, 'x')
    ]),
  ]
}

const ClassLevelEditor = ({ levels, onLevelsChange, disabled }) => {
  const onTempLevelChange = (level) => {
    onLevelsChange([
      level,
      ...levels,
    ].filter(Boolean)
    .filter(l => l.count > 0 || l.class !== '' || l.subclass !== ''));
  }
  const onLevelChange = (index) => (nextLevel) => {
    onLevelsChange(levels
      .map((l, i) => i === index ? nextLevel : l)
      .filter(Boolean)
      .filter(l => l.count > 0 || l.class !== '' || l.subclass !== ''));
  }

  return [
    h('div', { style: { height: '100%', display: 'flex', flexDirection: 'column' }}, [
      !disabled && h(ClassLevelEditorRow, { level: { count: 0, class: '', subclass: '' }, disabled, onLevelChange: onTempLevelChange, includeLabel: true }),
      !disabled && h('hr', { style: { margin: '16px 0 16px 0' }}),
      ...levels.map((level, i) => h(ClassLevelEditorRow, { level, includeLabel: false, onLevelChange: onLevelChange(i), disabled }))
    ]),
  ]
};

export const CharacterSheet/*: Component<CharacterSheetProps>*/ = ({ game, identity, player, character, readOnly }) => {
  const api = useAPI();
  const disabled = readOnly;
  const onSubmit = async (e) => {
    e.preventDefault();
  }
  const onChange = async (newProperties) => {
    const nextCharacter = { ...character, ...newProperties };
    await api.game.character.update(game.id, character.id, nextCharacter);
  }
  const onDeleteClick = async () => {
    await api.game.character.remove(game.id, character.id);
  }

  const {
    pronouns, name, backgroundDescription, maxHitpoints, speed, sizeCategory,
    levels, baseAC, baseACReason, hitDice
  } = character;

  return [
    h(BackgroundBox, {}, h(FeatureSection, { contentClassName: styles.characterSheet }, [
      h('form', { onSubmit, className: styles.characterSheet }, [
        h('div', { className: styles.characterSheetFieldRow }, [
          h(SmallTextInput, { label: `Name`, value: name, onChange: name => onChange({ name }), placeholder: `e.g. Torpus the Glib`, disabled }),
          h(PronounEditor, { pronouns, onPronounChange: pronouns => onChange({ pronouns }), disabled })
        ]),
        h('div', { style: { margin: '16px 0 16px 0', padding: '0 16px 0 16px', backgroundColor: '#e8e8e8', width: '100%', boxSizing: 'border-box' }}, [
          h('p', {}, `Example usage:`),
          h('p', {}, [
            h('strong', {}, name || "${name}"),
            ` runs through the crowd, looking for the assassin!`
          ]),
          pronouns.enabled && h('p', {}, [
            h('strong', { style: { textTransform: 'capitalize' } }, pronouns.possessive || "${possessive pronoun}"),
            ` drew `,
            h('strong', { style: { textTransform: 'lowercase' }, color: 'red' }, pronouns.object || "${object pronoun}"),
            ` shield, ready to block the deadly blow that was coming.`
          ]),
        ]),
        h('div', { className: styles.characterSheetFieldRow, style: { alignItems: 'flex-start' } }, [
          h(ClassLevelEditor, { levels, onLevelsChange: levels => onChange({ levels }), disabled }),
          h(LongTextArea, { text: backgroundDescription, onTextChange: backgroundDescription => onChange({ backgroundDescription }), disabled })
        ]),
        h('hr', { style: { width: '75%', margin: '64px auto 64px auto' } }),
        h('div', { className: styles.characterSheetFieldRow, style: { alignItems: 'center', justifyContent: 'flex-start' } }, [
          h(SmallNumberEditor, { onNumberChange: maxHitpoints => onChange({ maxHitpoints }), disabled, value: maxHitpoints, label: 'Hitpoint Maximum' }),
          //h(WordInput, { onChange: hitDie => onChange({ }), label: includeLabel ? `Class` : null, value: level.class, placeholder: `Cleric` }),
          h('label', { style: { display: 'flex', flexDirection: 'column', margin: '0 24px 0 24px' } }, [
            h('span', {}, 'Size Category'),
            h('select', { style: { padding: '16px' }, onChange: e => onChange({ sizeCategory: e.target.value }), disabled }, [
              h('option', { selected: sizeCategory === 'medium', value: 'medium' }, 'Medium'),
              h('option', { selected: sizeCategory === 'small', value: 'small' }, 'Small'),
            ]),
          ]),
          h(SmallNumberEditor, { onNumberChange: speed => onChange({ speed }), value: speed, label: 'Speed', disabled }),
        ]),
        h('div', { className: styles.characterSheetFieldRow }, [
          h(SmallNumberEditor, { onNumberChange: baseAC => onChange({ baseAC }), value: baseAC, label: 'Base AC', disabled }),
          h(SmallTextInput, { label: `Base AC Description`, value: baseACReason, disabled, onChange: baseACReason => onChange({ baseACReason }), placeholder: `e.g. Unarmored Defense, Full Plate` }),
        ]),
        h('div', { className: styles.characterSheetFieldRow }, [
          //h('p', {}, 'initiativeIconAssetId'),
        ]),
        //h('p', {}, 'alive'),
       
        h('div', { className: styles.characteSheetActions }, [
          h(CopperButton, { type: 'button', onClick: () => onDeleteClick(), disabled }, 'Delete Character')
        ]),
      ]),
    ])),
  ];
}