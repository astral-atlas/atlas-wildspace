// @flow strict
/*::
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { GameData } from "../../game/data";
import type { Component } from '@lukekaalim/act';
*/

import { AssetLibraryWindow } from "./window";
import { h } from "@lukekaalim/act";
import { AssetGrid, AssetGridItem } from "../grid";
import { useSelection } from "../../editor/selection";
import {
  EditorCheckboxInput,
  EditorForm,
  EditorFormSubmit,
  EditorTextInput,
} from "../../editor/form";

/*::
export type RoomLibraryProps = {
  gameData: GameData,
  client: WildspaceClient
};
*/

export const RoomLibrary/*: Component<RoomLibraryProps>*/ = ({
  gameData,
  client
}) => {
  const [selection, select] = useSelection()

  const selectedRoom = gameData.rooms.find(r => r.id === selection[0])

  const updateSelectedRoom = async (roomUpdate) => {
    if (!selectedRoom)
      return;
    
    const nextRoom = { ...selectedRoom, ...roomUpdate };
    await client.room.update(gameData.game.id, selectedRoom.id, nextRoom);
  }
  const onSubmitNewRoom = async () => {
    await client.room.create(gameData.game.id, '');
  }

  return h(AssetLibraryWindow, {
    editor: selectedRoom && h(EditorForm, {}, [
      h(EditorTextInput, { label: 'Title', text: selectedRoom.title, onTextChange: title => updateSelectedRoom({ title }) }),
      h(EditorCheckboxInput, { label: 'Hidden', checked: !!selectedRoom.hidden, onCheckedChange: hidden => updateSelectedRoom({ hidden }) })
    ]),
    content: [
      h(EditorForm, { onEditorSubmit: onSubmitNewRoom }, [
        h(EditorFormSubmit, { label: 'Create New Room' }),
      ]),
      h('hr'),
      h(AssetGrid, { }, gameData.rooms.map(room =>
        h(AssetGridItem, { id: room.id, select, selected: !!selection.find(id => id === room.id) }, room.title))),
    ]
  })
}