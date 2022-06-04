// @flow strict


/*::
import type { Component } from '@lukekaalim/act';
import type {
  Game, Character,
  MiniTheater, MonsterPiece, CharacterPiece,
  Monster, MonsterActor,
} from '@astral-atlas/wildspace-models';
import type { UserID } from "@astral-atlas/sesame-models";

import type { AssetDownloadURLMap } from "../../asset/map";
import type { WildspaceClient } from '@astral-atlas/wildspace-client2';
*/

import { h, useState } from "@lukekaalim/act"
import { useLibrarySelection } from "../librarySelection";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryShelf } from "../LibraryShelf";
import { EditorForm, EditorButton, EditorTextInput, EditorHorizontalSection } from "../../editor";
import { PopupOverlay } from "../../layout";
import { CharacterSheet2 } from "../../../www/characters/CharacterSheet2";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { CharacterSheet } from "../../paper/CharacterSheet";
import { EditorVerticalSection } from "../../editor/form";
import { OrderedListEditor } from "../../editor/list";

/*::
export type MiniTheaterAisleProps = {
  game: Game,
  userId: UserID,

  miniTheaters: $ReadOnlyArray<MiniTheater>,
  monsterPieces: $ReadOnlyArray<MonsterPiece>,
  characterPieces: $ReadOnlyArray<CharacterPiece>,

  characters: $ReadOnlyArray<Character>,
  monsters: $ReadOnlyArray<Monster>,
  monsterActors: $ReadOnlyArray<MonsterActor>,

  assets: AssetDownloadURLMap,

  client: WildspaceClient
}
*/

export const MiniTheaterAisle/*: Component<MiniTheaterAisleProps>*/ = ({
  game,
  userId,
  miniTheaters,
  monsterPieces,
  characterPieces,

  characters,
  monsters,
  monsterActors,

  assets,
  client,
}) => {
  const selection = useLibrarySelection();
  const [filter, setFilter] = useState('');

  const selectedMiniTheater = miniTheaters.find(m => selection.selected.has(`mini-theater:${m.id}`));
  const [stagingName, setStagingName] = useState('')

  const createNewTheater = async () => {
    setStagingName('');
    await client.game.miniTheater.create(game.id, {
      name: stagingName
    });
  }
  const updateSelectedTheater = async (newProps) => {
    if (!selectedMiniTheater)
      return;

    await client.game.miniTheater.update(game.id, selectedMiniTheater.id, newProps)
  }

  return [
    h(LibraryAisle, {
      floor: h(LibraryFloor, {}, [
        h(LibraryFloorHeader, {
          title: 'Mini Theaters',
          filter: { text: filter, onFilterInput: f => setFilter(f) }
        }, [
          h('hr'),
          h(EditorForm, {}, [
            h(EditorHorizontalSection, {}, [
              h(EditorVerticalSection, {}, [
                h(EditorTextInput, { label: 'Mini Theater Name', text: stagingName, onTextInput: setStagingName }),
                h(EditorButton, { label: "Create new Mini Theater", onButtonClick: createNewTheater })
              ]),
              h(EditorVerticalSection, {}, [
                
              ]),
              h(EditorVerticalSection, {}, [
                
              ])
            ]),
          ]),
        ]),
        h(LibraryShelf, { title: 'All Theaters', selection, books: miniTheaters.map(m => ({
          id: `mini-theater:${m.id}`,
          title: m.name,
        })) }),
        miniTheaters.map(t => {
          const theaterCharacterPieces = t.characterPieceIds
            .map(id => characterPieces.find(c => c.id === id))
            .filter(Boolean)
          const theaterMonsterPieces = t.monsterPieceIds
            .map(id => monsterPieces.find(mp => mp.id === id))
            .filter(Boolean)
          console.log(t.monsterPieceIds)
          return h(LibraryShelf, { title: `${t.name} Pieces`, books: [
            ...theaterCharacterPieces.map(c => ({
              id: `character-piece:${c.id}`,
              title: characters.find(ch => ch.id === c.characterId)?.name || c.id,
            })),
            ...theaterMonsterPieces.map(m => {
              const actor = monsterActors.find(ma => ma.id === m.monsterActorId);
              const monster = actor && monsters.find(m => m.id === actor.id)
              return {
                id: `monster-piece:${m.id}`,
                title: actor?.name || monster?.name || '',
              }
            }),
          ] })
        }),
      ]),
      desk: [
        !!selectedMiniTheater && h(EditorForm, {}, [
          h(EditorTextInput, {
            disabled: true,
            label: 'ID',
            text: selectedMiniTheater.id
          }),
          h(EditorTextInput, {
            label: 'Name',
            text: selectedMiniTheater.name,
            onTextInput: name => updateSelectedTheater({ name })
          }),
        ])
      ]
    }),
  ];
};
