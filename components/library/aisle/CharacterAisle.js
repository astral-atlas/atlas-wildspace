// @flow strict


/*::
import type { Component } from '@lukekaalim/act';
import type { Game, Character } from '@astral-atlas/wildspace-models';

import type { AssetDownloadURLMap } from "../../asset/map";
*/

import { h, useState } from "@lukekaalim/act"
import { useLibrarySelection } from "../librarySelection";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryShelf } from "../LibraryShelf";
import { EditorForm, EditorButton, EditorTextInput } from "../../editor";
import { PopupOverlay } from "../../layout";
import { CharacterSheet2 } from "../../../www/characters/CharacterSheet2";

/*::
export type CharacterAisleProps = {
  game: Game,
  characters: $ReadOnlyArray<Character>,
  assets: AssetDownloadURLMap,
}
*/

export const CharacterAisle/*: Component<CharacterAisleProps>*/ = ({
  game,
  characters,
  assets,
}) => {
  const selection = useLibrarySelection();

  const selectedCharacter = characters.find(c => selection.selected.has(c.id));
  const [editCharacterSheet, setEditCharacterSheet] = useState(false)

  return [
    h(LibraryAisle, {
      floor: h(LibraryShelf, { selection, books: characters.map(c => {
        const asset = c.art && c.art[0] && assets.get(c.art[0].assetId)
        return {
          id: c.id,
          title: c.name,
          coverURL: asset && asset.downloadURL,
        }
      }) }),
      desk: selectedCharacter && h(EditorForm, {}, [
        h(EditorTextInput, { disabled: true, label: 'ID', text: selectedCharacter.id }),
        h(EditorTextInput, { disabled: true, label: 'Name', text: selectedCharacter.name }),
        h(EditorButton, { label: 'Open Character Sheet', onButtonClick: () => setEditCharacterSheet(true) }),
      ])
    }),
    h(PopupOverlay, {
      visible: editCharacterSheet,
      onBackgroundClick: () => setEditCharacterSheet(false)
    }, selectedCharacter && h(CharacterSheet2, {
      game,
      character: selectedCharacter,
      disabled: false
    }))
  ];
};
