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
import type { WildspaceClient } from '@astral-atlas/wildspace-client2';
*/

import { h, useEffect, useRef, useState } from "@lukekaalim/act"
import { useLibrarySelection } from "../librarySelection";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryShelf } from "../LibraryShelf";
import { EditorForm, EditorButton, EditorTextInput, EditorHorizontalSection } from "../../editor";
import { PopupOverlay } from "../../layout";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { CharacterSheet } from "../../paper/CharacterSheet";
import { EditorVerticalSection, SelectEditor } from "../../editor/form";
import { OrderedListEditor } from "../../editor/list";
import { useRenderSetup } from "../../three";
import { useMiniTheaterController } from "../../miniTheater/useMiniTheaterController";
import { useMiniTheaterSceneController } from "../../miniTheater/useMiniTheaterSceneController";
import { MiniTheaterCanvas } from "../../miniTheater/MiniTheaterCanvas";
import { useResourcesLoader } from "../../encounter";
import { TextInput } from "../../preview/inputs";
import { useElementKeyboard } from "../../keyboard/changes";
import { MiniTheaterOverlay } from "../../miniTheater/MiniTheaterOverlay";

/*::
export type MiniTheaterAisleProps = {
  game: Game,
  userId: UserID,

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
  const updateSelectedTheater = async ({ name = null, pieces = null }) => {
    if (!selectedMiniTheater)
      return;
    await client.game.miniTheater.update(game.id, selectedMiniTheater.id, { name, pieces })
  }
  const applyAction = async (action/*: MiniTheaterAction*/) => {
    if (!selectedMiniTheater)
      return;
    await client.game.miniTheater.act(game.id, selectedMiniTheater.id, action)
  }

  const [showPreview, setShowPreview] = useState(false);

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
            ]),
          ]),
        ]),
        h(LibraryShelf, { title: 'All Theaters', selection, books: miniTheaters.map(m => ({
          id: `mini-theater:${m.id}`,
          title: m.name,
        })) }),
      ]),
      desk: [
        !!selectedMiniTheater && h(MiniTheaterEditor, {
          selectedMiniTheater,
          characters,
          monsters,
          monsterActors,
          updateSelectedTheater,
          deleteTheater,
          setShowPreview,
        })
      ]
    }),
    h(PopupOverlay, { visible: showPreview && !!selectedMiniTheater, onBackgroundClick: () => setShowPreview(false) },
      selectedMiniTheater && h(MiniTheaterPreview, {
        selectedMiniTheater,
        assets,
        characters,
        monsters,
        monsterActors,
        updateSelectedTheater,
        applyAction,
      }))
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
  assets
}) => {
  const controller = useMiniTheaterController();
  const resources = useResourcesLoader()
  const rootRef = useRef();

  useEffect(() => {
    const spm = controller.subscribePieceMove(event => {
      console.log(selectedMiniTheater.id, { event })
      applyAction({ type: 'move', movedPiece: event.pieceRef, position: event.position })
    })
    const spp = controller.subscribePieceAdd(event => {
      console.log(selectedMiniTheater.id, { event })
      applyAction({ type: 'place', placement: { ...event.placement, visible: true, position: event.position } })
    })
    return () => {
      spm();
      spp();
    }
  }, [selectedMiniTheater])

  const monsterMasks = monsterActors.map(ma => {
    const monster = monsters.find(mo => ma.monsterId == mo.id);
    if (!monster)
      return null;
    return {
      id: ma.id,
      name: ma.name || monster.name,
      conditions: ma.conditions,
      healthDescriptionText: 'Healthy',
      initiativeIconAssetId: monster.initiativeIconAssetId,
    }
  }).filter(Boolean)
  const [selectedId, setSelectedId] = useState();
  useEffect(() => {
    return controller.subscribeSelection(e => setSelectedId(e))
  }, [])
  const [placement, setPlacement] = useState();
  useEffect(() => {
    return controller.subscribePlacement(e => setPlacement(e))
  }, [])

  const emitter = useElementKeyboard(rootRef);

  return h('div', { ref: rootRef, tabIndex: 0, style: { width: '100%', height: '100%', position: 'relative' } }, [
    /*
    h(EditorForm, {}, [
      h(EditorHorizontalSection, {}, [
        monsterActors.map(ma =>
          h(EditorButton, {
            label: `${ma.name || ma.id}`,
            onButtonClick: () => controller.pickPlacement({ type: 'monster', monsterActorId: ma.id })
          }))
      ]),
      h(EditorButton, { label: 'Place Monster', text: selectedId ? selectedId.pieceRef : 'None' }),
      h(EditorTextInput, { diabled: true, label: 'Placement', text: placement ? placement.placement.type : 'None' }),
    ]),*/
    h(MiniTheaterOverlay, { characters, monsterActors, controller, assets }),
    h(MiniTheaterCanvas, {
      assets,
      controller,
      characters,
      miniTheater: selectedMiniTheater,
      monsterMasks,
      emitter,
      resources
    })
  ])
}