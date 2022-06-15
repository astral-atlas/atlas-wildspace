// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
import type { Character, AssetID, Game, LibraryData } from "@astral-atlas/wildspace-models";
import type { WildspaceClient, UpdatesConnection } from "@astral-atlas/wildspace-client2";
import type { UserID } from "@astral-atlas/sesame-models";

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
export type PlayerPrepLibraryProps = {
  client: WildspaceClient,
  userId: UserID,
  catalogueHeader?: ?ElementNode,
  characters: $ReadOnlyArray<Character>,
  assets: AssetDownloadURLMap,
  game: Game,
};
*/

export const PlayerPrepLibrary/*: Component<PlayerPrepLibraryProps>*/ = ({
  client,
  userId,
  catalogueHeader,
  characters,
  assets,
  game,
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
    aisle: h(CharacterAisle, { game, assets, characters, client, userId }),
  });
}
