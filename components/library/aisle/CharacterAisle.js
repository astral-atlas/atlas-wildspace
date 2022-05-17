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
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { CharacterSheet } from "../../paper/CharacterSheet";

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
  const [filter, setFilter] = useState('');

  const filteredCharacters = characters.filter(c => !filter || c.name.includes(filter))
  const selectedCharacter = filteredCharacters.find(c => selection.selected.has(c.id));

  return [
    h(LibraryAisle, {
      floor: h(LibraryFloor, {}, [
        h(LibraryFloorHeader, {
          title: 'Characters',
          filter: { text: filter, onFilterInput: f => setFilter(f) }
        }),
        h(EditorForm, {}, [
          h(EditorButton, { label: 'Create new Character' })
        ]),
        h(LibraryShelf, { selection, books: filteredCharacters.map(c => {
          const asset = c.art && c.art[0] && assets.get(c.art[0].assetId)
          return {
            id: c.id,
            title: c.name,
            coverURL: asset && asset.downloadURL,
          }
        }) })
      ]),
    }),
    h(PopupOverlay, {
      visible: !!selectedCharacter,
      onBackgroundClick: () => selection.replace([])
    }, selectedCharacter && h(CharacterSheet, {
      character: selectedCharacter,
    }))
  ];
};
