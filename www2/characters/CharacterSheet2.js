// @flow strict
/*:: import type { Component } from "@lukekaalim/act"; */
/*:: import type { Character, Player, Game } from "@astral-atlas/wildspace-models"; */
/*:: import type { GameData } from "../hooks/api.js"; */
import debounce from 'lodash.debounce';

import { BrandedTextInput, FeatureDivider, PlainLabel, ProficiencyInput, PlainNumberInput, SquareDivider, SegmentedTop, SegmentedBottom } from "@astral-atlas/wildspace-components";
import { h, useState } from '@lukekaalim/act';
import { useAPI } from "../hooks/api.js";
import { ArmorCalculator } from "../../components/composite/armor";

/*::
export type CharacterSheet2Props = {
  disabled: boolean,
  gameData: GameData,
  character: Character,
  player: Player,
  game: Game,
};
*/

export const CharacterSheet2/*: Component<CharacterSheet2Props>*/ = ({
  gameData,
  disabled = false,
  character,
  player,
  game,
}) => {
  const api = useAPI();
  const onChange = debounce(async updatedProps => {
    await api.game.character.update(game.id, character.id, { ...character, ...updatedProps });
  }, 500, { trailing: true })

  return [
    h('div', { style: { backgroundColor: 'white', borderRadius: '24px', padding: '24px', color: 'black' }}, [
      h(FeatureDivider, {}, [
        h(BrandedTextInput, { disabled, value: character.name, onChange: name => onChange({ name }) }),
        h(SegmentedTop, { style: { marginTop: '24px' }}, [
          h('div', { style: { display: 'flex', flexDirection: 'row', justifyContent: 'center' } }, [
            h(ProficiencyInput, { disabled, value: character.initiativeBonus, onChange: initiativeBonus => onChange({ initiativeBonus })  }, 'Initiative Bonus'),
          ]),
        ]),
        h(SegmentedBottom, { style: { marginTop: '24px' }}, [
          h('div', { style: { display: 'flex', flexDirection: 'row', justifyContent: 'center' } }, [
            h(PlainLabel, { label: 'Hitpoint Maximum', style: { direction: 'above', fontFamily: 'Martel Sans' } },
              h(PlainNumberInput, { disabled, value: character.maxHitpoints, onChange: maxHitpoints => onChange({ maxHitpoints }) })),
          ]),
        ]),
        !disabled && h('button', { onClick: () => api.game.character.remove(game.id, character.id) }, 'Delete'),
      ]),
    ]),
  ];
};

/*::
export type CharacterSheetCreatorProps = {
  gameData: GameData,
  player: Player,
  game: Game,
};
*/
export const CharacterSheetCreator/*: Component<CharacterSheetCreatorProps>*/ = ({ player, game, gameData }) => {
  const [name, setName] = useState('');

  return [
    h('div', { style: { backgroundColor: 'white', borderRadius: '24px' }}, [
      h(FeatureDivider, {}, [
        h(BrandedTextInput, { value: name, onChange: setName })
      ])
    ]),
  ];
}