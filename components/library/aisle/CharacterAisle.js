// @flow strict


/*::
import type { Component } from '@lukekaalim/act';
import type { Game, Character } from '@astral-atlas/wildspace-models';
import type { UserID } from "@astral-atlas/sesame-models";

import type { AssetDownloadURLMap } from "../../asset/map";
import type { WildspaceClient } from '@astral-atlas/wildspace-client2';
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
  userId: UserID,
  characters: $ReadOnlyArray<Character>,
  assets: AssetDownloadURLMap,

  client: WildspaceClient
}
*/

export const CharacterAisle/*: Component<CharacterAisleProps>*/ = ({
  game,
  userId,
  characters,
  assets,
  client,
}) => {
  const selection = useLibrarySelection();
  const [filter, setFilter] = useState('');

  const filteredCharacters = characters.filter(c => !filter || c.name.toLowerCase().includes(filter.toLowerCase()))
  const selectedCharacter = filteredCharacters.find(c => selection.selected.has(c.id));

  const myCharacters = filteredCharacters.filter(c => c.playerId === userId);

  const onCreateNewCharacter = async () => {
    await client.game.character.create(game.id, "Untitled Character", userId);
  }

  return [
    h(LibraryAisle, {
      floor: h(LibraryFloor, {}, [
        h(LibraryFloorHeader, {
          title: 'Characters',
          filter: { text: filter, onFilterInput: f => setFilter(f) }
        }),
        h(EditorForm, {}, [
          h(EditorButton, { label: 'Create new Character', onButtonClick: () => onCreateNewCharacter() })
        ]),
        h(LibraryShelf, { title: 'My Characters', selection, books: myCharacters.map(c => {
          const artAsset = c.art && c.art[0] && assets.get(c.art[0].assetId);
          const iconAsset = c.initiativeIconAssetId && assets.get(c.initiativeIconAssetId);
          return {
            id: c.id,
            title: c.name,
            coverURL: (artAsset && artAsset.downloadURL) || (iconAsset && iconAsset.downloadURL),
          }
        }) }),
        h(LibraryShelf, { title: 'All Characters', selection, books: filteredCharacters.map(c => {
          const artAsset = c.art && c.art[0] && assets.get(c.art[0].assetId);
          const iconAsset = c.initiativeIconAssetId && assets.get(c.initiativeIconAssetId);
          return {
            id: c.id,
            title: c.name,
            coverURL: (artAsset && artAsset.downloadURL) || (iconAsset && iconAsset.downloadURL),
          }
        }) }),
      ]),
    }),
    h(PopupOverlay, {
      visible: !!selectedCharacter,
      onBackgroundClick: () => selection.replace([])
    }, selectedCharacter && h(CharacterSheet, {
      assets,
      character: selectedCharacter,
      client,
      disabled: selectedCharacter.playerId !== userId,
    }))
  ];
};
