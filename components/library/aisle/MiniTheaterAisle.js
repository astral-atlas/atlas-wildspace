// @flow strict


/*::
import type { Component } from '@lukekaalim/act';
import type {
  Game, Character,
  MiniTheater, MiniTheaterAction,
  Monster, MonsterActor,
} from '@astral-atlas/wildspace-models';
import type { UserID } from "@astral-atlas/sesame-models";

import type { AssetDownloadURLMap } from "../../asset/map";
import type { WildspaceClient, UpdatesConnection } from '@astral-atlas/wildspace-client2';
*/

import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act"
import { useLibrarySelection } from "../librarySelection";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryShelf } from "../LibraryShelf";
import { EditorForm, EditorButton, EditorTextInput, EditorHorizontalSection } from "../../editor";
import { PopupOverlay } from "../../layout";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { CharacterSheet } from "../../paper/CharacterSheet";
import {
  EditorNumberInput,
  EditorVerticalSection,
  SelectEditor,
} from "../../editor/form";
import { OrderedListEditor } from "../../editor/list";
import { useRenderSetup } from "../../three";
import { useMiniTheaterController } from "../../miniTheater/useMiniTheaterController";
import { useMiniTheaterSceneController } from "../../miniTheater/useMiniTheaterSceneController";
import { MiniTheaterCanvas } from "../../miniTheater/MiniTheaterCanvas";
import { useResourcesLoader } from "../../encounter";
import { TextInput } from "../../preview/inputs";
import { useElementKeyboard } from "../../keyboard/changes";
import { MiniTheaterOverlay } from "../../miniTheater/MiniTheaterOverlay";
import { useAisleFocus } from "../useAisleFocus";
import { LibraryDesk } from "../LibraryDesk";
import {
  useKeyboardTrack,
  useKeyboardTrackEmitter,
} from "../../keyboard/track";
import { useTrackedKeys } from "../../utils/trackedKeys";
import { SceneRenderer2 } from "../../scene";
import { useMiniTheaterController2 } from "../../miniTheater/useMiniTheaterController2";

/*::
export type MiniTheaterAisleProps = {
  game: Game,
  userId: UserID,
  updates: UpdatesConnection,

  miniTheaters: $ReadOnlyArray<MiniTheater>,

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
  updates,
  miniTheaters,

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
    await client.game.miniTheater.create(game.id, { name: stagingName });
  }
  const deleteTheater = (theaterId) => async () => {
    await client.game.miniTheater.destroy(game.id, theaterId);
  }
  const updateSelectedTheater = async ({ name = null, pieces = null, baseArea = null }) => {
    if (!selectedMiniTheater)
      return;
    await client.game.miniTheater.update(game.id, selectedMiniTheater.id, { name, pieces, baseArea })
  }
  const applyAction = async (action/*: MiniTheaterAction*/) => {
    if (!selectedMiniTheater)
      return;
    await client.game.miniTheater.act(game.id, selectedMiniTheater.id, action)
  }

  const { focus, toggleFocus } = useAisleFocus();

  const [showPreview, setShowPreview] = useState(false);

  const floor = h(LibraryFloor, {}, [
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
        ]),
      ]),
    ]),
    h(LibraryShelf, { title: 'All Theaters', selection, books: miniTheaters.map(m => ({
      id: `mini-theater:${m.id}`,
      title: m.name,
    })) }),
  ])

  const desk = h(LibraryDesk, {}, !!selectedMiniTheater && [
    h(MiniTheaterEditor, {
      selectedMiniTheater,
      characters,
      monsters,
      monsterActors,
      updateSelectedTheater,
      deleteTheater,
      setShowPreview,
    }),
    h(EditorButton, { label: 'Workstation', onButtonClick: toggleFocus })
  ]);

  const workstation = [!!selectedMiniTheater &&
    h(MiniTheaterPreview, {
      updates,
      selectedMiniTheater,
      assets,
      characters,
      monsters,
      monsterActors,
      updateSelectedTheater,
      applyAction,
    })
  ];

  return [
    h(LibraryAisle, {
      focus,
      floor,
      desk,
      workstation,
    })
  ];
};

const MiniTheaterEditor = ({
  selectedMiniTheater,
  updateSelectedTheater,
  deleteTheater,
  setShowPreview,

  characters,
  monsters,
  monsterActors,
}) => {
  const [stagingType, setStagingType] = useState('monster');
  const [stagingCharacterId, setStagingCharacterId] = useState(null)
  const [stagingMonsterActorId, setStagingMonsterActorId] = useState(null)

  const addPieceDisabled =
    (stagingType === 'monster' && !stagingMonsterActorId) ||
    (stagingType === 'character' && !stagingCharacterId)

  return h(EditorForm, {}, [
    h(EditorButton, { label: 'Show Preview', onButtonClick: () => setShowPreview(true) }),
    h(EditorButton, { label: 'Delete Theater', onButtonClick: deleteTheater(selectedMiniTheater.id) }),
    h(EditorTextInput, {
      disabled: true,
      label: 'ID',
      text: selectedMiniTheater.id
    }),
    h(EditorNumberInput, {
      label: 'X',
      number: selectedMiniTheater.baseArea.size.x,
      onNumberInput: x => updateSelectedTheater({
        baseArea: {
          ...selectedMiniTheater.baseArea,
          size: { ...selectedMiniTheater.baseArea.size, x }
        }
      })
    }),
    h(EditorNumberInput, {
      label: 'Y',
      number: selectedMiniTheater.baseArea.size.y,
      onNumberInput: y => updateSelectedTheater({
        baseArea: {
          ...selectedMiniTheater.baseArea,
          size: { ...selectedMiniTheater.baseArea.size, y }
        }
      })
    }),
    h(EditorNumberInput, {
      label: 'Z',
      number: selectedMiniTheater.baseArea.size.z,
      onNumberInput: z => updateSelectedTheater({
        baseArea: {
          ...selectedMiniTheater.baseArea,
          size: { ...selectedMiniTheater.baseArea.size, z }
        }
      })
    }),
    h(EditorTextInput, {
      label: 'Name',
      text: selectedMiniTheater.name,
      onTextInput: name => updateSelectedTheater({ name })
    }),
    h(EditorVerticalSection, {}, [
      h(SelectEditor, {
        label: 'Type',
        values: [{ value: 'monster' }, { value: 'character' }],
        selected: stagingType,
        onSelectedChange: setStagingType
      }),
      stagingType === 'monster' && [
        h(SelectEditor, {
          label: 'Monster Actor',
          values: monsterActors.map(m => ({ value: m.id, title: m.name || m.id })),
          selected: stagingMonsterActorId,
          onSelectedChange: setStagingMonsterActorId
        }),
      ],
      stagingType === 'character' && [
        h(SelectEditor, {
          label: 'Character',
          values: characters.map(c => ({ value: c.id, title: c.name })),
          selected: stagingCharacterId,
          onSelectedChange: setStagingCharacterId
        }),
      ],
      h(EditorButton, { label: 'Add Piece', disabled: addPieceDisabled }),
    ]),
    h('ul', {}, [
      selectedMiniTheater.pieces.map(p => {
        return h('li', {}, p.id)
      })
    ])
  ])
}

const MiniTheaterPreview = ({
  selectedMiniTheater,
  monsters, monsterActors, characters,
  updateSelectedTheater,
  applyAction,
  updates,
  assets
}) => {
  const resources = useMemo(() => {
    return {
      assets: new Map(),
      characters: new Map(),
      monsterMasks: new Map(),
      meshMap: new Map(),
      textureMap: new Map(),
    };
  }, [])
  const controller = useMiniTheaterController2(
    selectedMiniTheater.id,
    resources,
    updates,
    true,
  );
  const content = useMemo(() => ({
    type: 'mini-theater',
    miniTheaterId: selectedMiniTheater.id,
  }), [selectedMiniTheater.id]);

  return h(SceneRenderer2, {
    content,
    miniTheaterController: controller,
  });
}