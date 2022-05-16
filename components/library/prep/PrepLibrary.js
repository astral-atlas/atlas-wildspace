// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
import type { Character, AssetID } from "@astral-atlas/wildspace-models";

import type { AssetDownloadURLMap } from "../../asset/map";
import type { GameData, } from "../../game/data";
*/

import { h, useState } from "@lukekaalim/act";
import { Library } from "../Library";
import { LibraryCatalogue } from "../LibraryCatalogue";
import { LibraryShelf } from "../LibraryShelf";
import { EditorForm, EditorTextInput } from "../../editor/form";
import { useLibrarySelection } from "../librarySelection";
import { LibraryAisle } from "../LibraryAisle";
import { CharacterAisle } from "../aisle/CharacterAisle";

/*::
export type PrepLibraryProps = {
  gameData: GameData
};
*/

export const PrepLibrary/*: Component<PrepLibraryProps>*/ = ({ gameData }) => {
  return null;
}

/*::
export type PlayerPrepLibraryProps = {
  catalogueHeader: ?ElementNode,
  characters: $ReadOnlyArray<Character>,
  assets: AssetDownloadURLMap,
};
*/

export const PlayerPrepLibrary/*: Component<PlayerPrepLibraryProps>*/ = ({
  catalogueHeader,
  characters,
  assets,
}) => {
  const [activeAisleId, setActiveAisleId] = useState('CHAR');
  const selection = useLibrarySelection();

  const selectedCharacter = characters.find(c => selection.selected.has(c.id));

  return h(Library, {
    catalogue: [
      !!catalogueHeader && [
        catalogueHeader,
        h('hr'),
      ],
      h(LibraryCatalogue, { activeAisleId: activeAisleId, aisles: [
        { id: 'CHAR', title: 'Characters '},
      ], onActivateAisle: id => setActiveAisleId(id) })
    ],
    aisle: h(LibraryAisle, {
      floor: h(LibraryShelf, { selection, books: characters.map(c => {
        const mainArtAsset = c.art && c.art[0] && assets.get(c.art[0].assetId);
        return  {
          id: c.id,
          title: c.name,
          coverURL: mainArtAsset ? mainArtAsset.downloadURL : null
        }
      }) }),
      desk: selectedCharacter && h(EditorForm, {}, [
        h(EditorTextInput, { label: 'ID', text: selectedCharacter.id, disabled: true }),
        h(EditorTextInput, { label: 'Name', text: selectedCharacter.name }),
      ])
    }),
    aisle: h(CharacterAisle, { assets, characters }),
  });
}