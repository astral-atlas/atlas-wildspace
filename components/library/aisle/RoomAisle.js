// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient, UpdatesConnection } from "@astral-atlas/wildspace-client2";
import type {
  LibraryData, Monster, Room, Game,
  AssetID, AssetInfo } from "@astral-atlas/wildspace-models";
import type { AssetDownloadURLMap } from "../../asset/map";
*/

import { h, useEffect, useMemo, useState } from "@lukekaalim/act";
import debounce from "lodash.debounce";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { LibraryShelf } from "../LibraryShelf";
import { useLibrarySelection } from "../librarySelection";
import {
  EditorButton,
  EditorCheckboxInput,
  EditorForm,
  EditorHorizontalSection,
  EditorNumberInput,
  EditorTextInput,
  EditorVerticalSection,
  FilesButtonEditor,
  SelectEditor,
} from "../../editor/form";
import { useAisleFocus } from "../useAisleFocus";
import { useRoomPageMiniTheaterResources } from "../../miniTheater/resources/roomResources";
import { useLibraryMiniTheaterResources } from "../../miniTheater/resources/libraryResources";
import { createDefaultRoomState, reduceRoomState } from "@astral-atlas/wildspace-models";
import { useMiniTheaterController2 } from "../../miniTheater/useMiniTheaterController2";
import { useMiniTheaterState } from "../../miniTheater/useMiniTheaterState";
import { getContentRenderData } from "../../scene/content/sceneContentRenderData";
import { SceneContentEditor } from "../../scene/SceneContentEditor";
import { v4 } from "uuid";
import { createAssetDownloadURLMap } from "../../asset/map";

/*::
export type RoomAisleProps = {
  game: Game,
  client: WildspaceClient,
  rooms: $ReadOnlyArray<Room>,

  library: LibraryData,
  assets: AssetDownloadURLMap,
  updates: UpdatesConnection,
}
*/

export const RoomAisle/*: Component<RoomAisleProps>*/ = ({
  game,
  client,
  rooms,

  library,
  assets,
  updates,
}) => {
  const selection = useLibrarySelection();
  const selectedRoom = rooms.find(r => selection.selected.has(r.id));
  const selectedRoomState = selectedRoom && (
    library.roomStates.find((state) =>
      state.roomId === selectedRoom.id)
    || createDefaultRoomState(selectedRoom.id)
    );

  const { focus, toggleFocus } = useAisleFocus();
  

  const onCreateRoom = async () => {
    await client.game.rooms.create(game.id, { title: 'Untitled Room', hidden: true })
  }
  const onUpdateRoom = async (room, roomProps) => {
    await client.game.rooms.update(game.id, room.id, { ...room, ...roomProps });
  }
  const onDeleteRoom = async (room) => {
    await client.game.rooms.destroy(game.id, room.id)
  }
  const [stagingContent, setStatingContent] = useState(null)
  const [stagingAssets, setStagingAssets] = useState/*:: <[AssetID, ?AssetInfo][]>*/([])

  useEffect(() => {
    if (!stagingContent)
      return;
    if (stagingContent.type !== 'exposition')
      return;
    if (stagingContent.exposition.background.type !== 'image')
      return;

    const assetId = stagingContent.exposition.background.assetId;
    client.asset.peek(assetId)
      .then(info => setStagingAssets(a => [...a, [assetId, { ...info, downloadURL: info.downloadURL.href }]]))
  }, [stagingContent])
  const onContentUpdate = (nextContent) => {
    setStatingContent(nextContent)
  };
  const onStagingSave = async () => {
    if (!selectedRoom || !stagingContent)
      return;
    updates.roomPage.submitAction(selectedRoom.id, {
      type: 'change-scene-content',
      content: stagingContent,
      id: v4(),
      time: Date.now()
    })
    setStatingContent(null);
  }

  const [sceneToLoad, setSceneToLoad] = useState(null);
  const onLoadScene = async (selectedRoom) => {
    const scene = library.scenes.find(s => s.id === sceneToLoad)
    if (!scene)
      return;
    
    updates.roomPage.submitAction(selectedRoom.id, {
      type: 'load-scene',
      scene,
      id: v4(),
      time: Date.now()
    })
  }

  const workstation = selectedRoom && h(RoomWorkstation, {
    library,
    room: selectedRoom,
    updates,
    assets: new Map([...assets, ...stagingAssets]),
    client,
    stagingContent,
    onContentUpdate,
  });

  return h(LibraryAisle, {
    focus,
    workstation,
    floor: h(LibraryFloor, {
      header: [
        h(LibraryFloorHeader, { title: 'Rooms',  }, [
          h(EditorForm, {}, [
            h(EditorHorizontalSection, {}, [
              h(EditorVerticalSection, {}, [
                h(EditorButton, { label: 'Create Room', onButtonClick: onCreateRoom })
              ]),
            ])
          ])
        ]),
      ]
    }, [
      h(LibraryShelf, { selection, books: rooms.map(r => ({
        title: r.title,
        id: r.id
      })) }),
    ]),
    desk: [
      !!selectedRoom && h(EditorForm, {}, [
        h(EditorTextInput, {
          label: 'Title', text: selectedRoom.title || '',
          onTextInput: debounce((title) => onUpdateRoom(selectedRoom, { title }), 1000),
        }),
        h(EditorCheckboxInput, {
          label: 'Hidden',
          checked: selectedRoom.hidden || false,
          onCheckedChange: debounce((hidden) => onUpdateRoom(selectedRoom, { hidden }), 1000)
        }),
        h(EditorButton, {
          label: 'Delete Room', onButtonClick: () => onDeleteRoom(selectedRoom)
        }),
        h(EditorHorizontalSection, {}, [
          h(SelectEditor, {
            label: 'Scene To Load',
            values: [...library.scenes.map(s => ({
              title: s.title,
              value: s.id,
            })), { value: '', title: 'N/A' }],
            selected: sceneToLoad,
            onSelectedChange: setSceneToLoad
          }),
          h(EditorButton, {
            label: 'Load Scene', onButtonClick: () => onLoadScene(selectedRoom)
          }),
        ]),
        h(EditorButton, {
          label: 'Edit Room', onButtonClick: () => toggleFocus()
        }),
        h(EditorButton, {
          label: 'Save Changes', onButtonClick: () => onStagingSave()
        }),
      ]),
    ]
  })
}

const RoomWorkstation = ({ library, room, updates, assets, client, onContentUpdate, stagingContent }) => {
  const resources = useLibraryMiniTheaterResources(library)
  const roomState = library.roomStates.find((state) => state.roomId === room.id) || createDefaultRoomState(room.id);
  const content = stagingContent || (roomState && roomState.scene.content);

  const miniTheaterId = (
    (content.type === 'mini-theater' && content.miniTheaterId)
    || (content.type === 'exposition' && content.exposition.background.type === 'mini-theater' &&
        content.exposition.background.miniTheaterId)
    || null
  )
  
  const controller = useMiniTheaterController2(miniTheaterId, resources, updates, true);
  const miniTheaterState = useMiniTheaterState(controller);

  const sceneContentRenderData = getContentRenderData(
    content,
    miniTheaterState,
    controller,
    assets,
  );

  return h(SceneContentEditor, {
    assets, client, connection: updates,
    content, library,
    onContentUpdate
  });
}