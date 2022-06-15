// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { LibraryData, Monster, MonsterActor, Game } from "@astral-atlas/wildspace-models";
import type { AssetDownloadURLMap } from "../../asset/map";
*/

import { h, useState } from "@lukekaalim/act";
import debounce from "lodash.debounce";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { LibraryShelf } from "../LibraryShelf";
import { useLibrarySelection } from "../librarySelection";
import {
  EditorButton,
  EditorForm,
  EditorHorizontalSection,
  EditorNumberInput,
  EditorTextInput,
  EditorVerticalSection,
  FilesButtonEditor,
  SelectEditor,
} from "../../editor/form";

/*::
export type MonsterAisleProps = {
  game: Game,
  assets: AssetDownloadURLMap,
  client: WildspaceClient,
  monsters: $ReadOnlyArray<Monster>,
  monsterActors: $ReadOnlyArray<MonsterActor>,
}
*/

export const MonsterAsile/*: Component<MonsterAisleProps>*/ = ({
  game,
  assets,
  client,
  monsters,
  monsterActors
}) => {
  const selection = useLibrarySelection();
  const selectedMonsterActor = monsterActors.find(m => selection.selected.has(`monster-actor:${m.id}`));
  const selectedMonster = monsters.find(m =>
    selection.selected.has(`monster:${m.id}`) ||
    (selectedMonsterActor && selectedMonsterActor.monsterId == m.id)
  );

  const [stagingMonsterName, setStagingMonsterName] = useState('');

  const onCreateMonster = async () => {
    await client.game.monster.create(game.id, { name: stagingMonsterName })
  }
  const onUpdateMonster = async (monster, monsterProps) => {
    await client.game.monster.update(game.id, monster.id, { ...monster, ...monsterProps})
  }
  const onDeleteMonster = (monster) => async () => {
    await client.game.monster.destroy(game.id, monster.id)
  }

  const onUploadMonsterIcon = async (monster, iconFile) => {
    const assetInfo = await client.asset.create(`Monster:${iconFile.name}`, iconFile.type, new Uint8Array(await iconFile.arrayBuffer()));
    onUpdateMonster(monster, { initiativeIconAssetId: assetInfo.description.id })
  }

  const [stagingActorName, setStagingActorName] = useState('');
  const [stagingActorMonsterId, setStagingActorMonsterId] = useState(null);
  const onCreateMonsterActor = async () => {
    if (!stagingActorMonsterId)
      return;
    await client.game.monster.actors.create(game.id, { monsterId: stagingActorMonsterId, name: stagingActorName })
  }
  const onUpdateMonsterActor = async (actor, { name = null, conditions = null, hitpoints = null, secretName = null }) => {
    await client.game.monster.actors.update(game.id, actor.id, { name, conditions, hitpoints, secretName })
  }
  const onDeleteMonsterActor = (monsterActorId) => async () => {
    await client.game.monster.actors.destroy(game.id, monsterActorId)
  }

  return h(LibraryAisle, {
    floor: h(LibraryFloor, {
      header: [
        h(LibraryFloorHeader, { title: 'Monsters',  }, [
          h(EditorForm, {}, [
            h(EditorHorizontalSection, {}, [
              h(EditorVerticalSection, {}, [
                h(EditorTextInput, { label: 'Monster Name', onTextInput: setStagingMonsterName, text: stagingMonsterName }),
                h(EditorButton, { label: 'Create Monster', onButtonClick: onCreateMonster })
              ]),
              h(EditorVerticalSection, {}, [
                h(SelectEditor, {
                  values: [...monsters.map(m => ({ value: m.id, title: m.name })), { value: '', title: 'None' }],
                  label: 'Monster',
                  value: stagingActorMonsterId || '', onSelectedChange: setStagingActorMonsterId }),
                h(EditorTextInput, { label: 'Monster Actor Name', text: stagingActorName, onTextInput: setStagingActorName }),
                h(EditorButton, { disabled: !stagingActorMonsterId, label: 'Create Monster Actor', onButtonClick: onCreateMonsterActor })
              ]),
            ])
          ])
        ]),
      ]
    }, [
      h(LibraryShelf, { selection, title: 'All Monsters', books: monsters.map(m => ({
        title: m.name,
        id: `monster:${m.id}`
      })) }),
      monsters.map(monster => {
        const actors = monsterActors.filter(a => a.monsterId === monster.id);
        return h(LibraryShelf, { selection, title: monster.name, books: actors.map(ma => ({
          title: ma.secretName || ma.name || monster.name,
          id: `monster-actor:${ma.id}`
        })) })
      }),
    ]),
    desk: [
      !!selectedMonsterActor && h(EditorForm, {}, [
        h(EditorTextInput, {
          label: 'Monster Actor Name', text: selectedMonsterActor.name || '',
          onTextInput: debounce((name) => onUpdateMonsterActor(selectedMonsterActor, { name })),
        }),
        h(EditorNumberInput, { label: 'Hitpoints', number: selectedMonsterActor.hitpoints }),
        h(EditorButton, { label: 'Delete Monster', onButtonClick: onDeleteMonsterActor(selectedMonsterActor.id) })
      ]),
      !!selectedMonsterActor && !!selectedMonster && h('hr'),
      !!selectedMonster && h(EditorForm, {}, [
        h(EditorTextInput, {
          label: 'Monster Name', text: selectedMonster.name,
          onTextInput: debounce((name) => onUpdateMonster(selectedMonster, { name })) }),
        h(FilesButtonEditor, { label: 'Monster Icon', onFilesChange: files => onUploadMonsterIcon(selectedMonster, files[0]) }),
        !!selectedMonster.initiativeIconAssetId &&
          h('img', { src: assets.get(selectedMonster.initiativeIconAssetId)?.downloadURL || '' }, ),
        h(EditorNumberInput, {
          label: 'Monster Max Hitpoints', number: selectedMonster.maxHitpoints,
          onNumberInput: debounce((maxHitpoints) => onUpdateMonster(selectedMonster, { maxHitpoints })),
        }),
        h(EditorButton, { label: 'Delete Monster', onButtonClick: onDeleteMonster(selectedMonster) })
      ])
    ]
  })
}