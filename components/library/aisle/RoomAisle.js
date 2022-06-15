// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { LibraryData, Monster, Room, Game } from "@astral-atlas/wildspace-models";
*/

import { h, useState } from "@lukekaalim/act";
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

/*::
export type RoomAisleProps = {
  game: Game,
  client: WildspaceClient,
  rooms: $ReadOnlyArray<Room>,
}
*/

export const RoomAisle/*: Component<RoomAisleProps>*/ = ({
  game,
  client,
  rooms,
}) => {
  const selection = useLibrarySelection();
  const selectedRoom = rooms.find(r => selection.selected.has(r.id));

  const onCreateRoom = async () => {
    await client.room.create(game.id, 'Untitled Room')
  }
  const onUpdateRoom = async (room, roomProps) => {
    await client.room.update(game.id, room.id, { ...room, ...roomProps })
  }
  const onDeleteRoom = async (room) => {
    await client.room.destroy(game.id, room.id)
  }

  return h(LibraryAisle, {
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
        })
      ]),
    ]
  })
}