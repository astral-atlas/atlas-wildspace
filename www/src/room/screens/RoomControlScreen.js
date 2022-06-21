// @flow strict

import { EditorForm, EditorHorizontalSection, EditorVerticalSection, SelectEditor } from "@astral-atlas/wildspace-components";
import { h, useEffect, useState } from "@lukekaalim/act";
import { WindowScreen } from "./WindowScreen";

export const RoomControlScreen = ({ roomController }) => {
  const { gamePage, roomPage, client, updates } = roomController;
  const [libraryData, setLibraryData] = useState(null);
  useEffect(() => updates.library.subscribe(setLibraryData), [updates]);

  return h(WindowScreen, {}, [
    libraryData && h(EditorForm, {}, [
      h(EditorHorizontalSection, {}, [
        h(EditorVerticalSection, {}, [
          h(SelectEditor, {
            label: 'Active Scene',
            values: [
              ...libraryData.scenes.map(s => ({ value: s.id, title: s.title })),
              { value: '', title: 'None' }
            ],
            selected: roomPage.scene && roomPage.scene.id || '',
            onSelectedChange: async sceneId => {
              client.room.scene.set(gamePage.game.id, roomPage.room.id, { activeScene: sceneId || null })
            }
          })
        ]),
        h(EditorVerticalSection, {}, [
          h('div',{}, 'hello')
        ]),
      ])
    ])
  ]);
}