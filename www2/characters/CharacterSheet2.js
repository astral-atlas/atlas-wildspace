// @flow strict
/*:: import type { Component } from "@lukekaalim/act"; */
/*:: import type { Character, Player, Game } from "@astral-atlas/wildspace-models"; */
/*:: import type { GameData } from "../hooks/api.js"; */
import debounce from 'lodash.debounce';

import {
  BrandedTextInput, FeatureDivider, PlainLabel,
  ProficiencyInput, PlainNumberInput, SquareDivider, SegmentedTop,
  SegmentedBottom, SegmentedMiddle,
} from "@astral-atlas/wildspace-components";
import { h, useState } from '@lukekaalim/act';
import { useAPI } from "../hooks/api.js";
import { ArmorCalculator } from "../../components/composite/armor";
import { useAsync } from '../hooks/async.js';

/*::
export type CharacterSheet2Props = {
  disabled: boolean,
  character: Character,
  game: Game,
};
*/

export const CharacterSheet2/*: Component<CharacterSheet2Props>*/ = ({
  disabled = false,
  character,
  game,
}) => {
  const api = useAPI();
  const onChange = debounce(async updatedProps => {
    await api.game.character.update(game.id, character.id, { ...character, ...updatedProps });
  }, 500, { trailing: true })

  return [
    h('div', { style: { backgroundColor: 'white', borderRadius: '24px', padding: '24px', color: 'black' }}, [
      h(FeatureDivider, { style: {}}, [
        h('span', { style: { display: 'flex', alignItems: 'center', justifyContent: 'center' } }, h(BrandedTextInput, { disabled, value: character.name, onChange: name => onChange({ name }) })),
        h(SegmentedTop, { style: { marginTop: '24px' }}, [
          h('div', { style: { display: 'flex', flexDirection: 'row', justifyContent: 'center' } }, [
            h(ProficiencyInput, { disabled, value: character.initiativeBonus, onChange: initiativeBonus => onChange({ initiativeBonus })  }, 'Initiative Bonus'),
          ]),
        ]),
        h(SegmentedMiddle, { style: { marginTop: '24px' }}, [
          h('div', { style: { display: 'flex', flexDirection: 'row', justifyContent: 'center' } }, [
            h(PlainLabel, { label: 'Hitpoint Maximum', style: { direction: 'above', fontFamily: 'Martel Sans' } },
              h(PlainNumberInput, { disabled, value: character.maxHitpoints, onChange: maxHitpoints => onChange({ maxHitpoints }) })),
          ]),
        ]),
        h(SegmentedBottom, { style: { marginTop: '24px' }}, [
          h('div', { style: { display: 'flex', flexDirection: 'row', justifyContent: 'center' } }, [
            h(CharacterImageControl, { character, game, disabled }, 'Upload')
          ]),
        ]),
        !disabled && h('button', { onClick: () => api.game.character.remove(game.id, character.id) }, 'Delete'),
      ]),
    ]),
  ];
};

const CharacterImageControl = ({ disabled, character, game }) => {
  const [imageFile, setImageFile] = useState/*:: <?File>*/(null);
  const api = useAPI();

  const [imageAsset] = useAsync(async () =>
    character.initiativeIconAssetId ? api.asset.peek(character.initiativeIconAssetId) : null,
    [character.initiativeIconAssetId])

  const onClick = async (e) => {
    e.preventDefault();
    if (!imageFile) 
      return;
    const buffer = new Uint8Array(await imageFile.arrayBuffer());
    
    const asset = await api.asset.create(imageFile.name, imageFile.type, buffer);
    await api.game.character.update(game.id, character.id, { ...character, initiativeIconAssetId: asset.description.id });
  }

  return [
    imageAsset ? h('img', { src: imageAsset && imageAsset.downloadURL, width: 64, height: 64 }) : h('div', { style: { width: '64px', height: '64px'}}),
    h(PlainLabel, { label: 'Initiative Icon', style: { direction: 'above', fontFamily: 'Martel Sans', marginLeft: '24px' } },
      h('input', { type: 'file', disabled, onChange: e => setImageFile(e.target.files[0]) })),
    h('button', { onClick, type: 'button', disabled: disabled || !imageFile  }, 'Upload'),
  ]
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