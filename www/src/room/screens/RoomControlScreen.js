// @flow strict

import { EditorForm, EditorHorizontalSection, EditorVerticalSection, RoomStateEditor, SelectEditor } from "@astral-atlas/wildspace-components";
import { h, useEffect, useState } from "@lukekaalim/act";
import { WindowScreen } from "./WindowScreen";

export const RoomControlScreen = ({ roomController }) => {
  const { gamePage, roomPage, client, updates } = roomController;
  const [libraryData, setLibraryData] = useState(null);
  useEffect(() => updates.library.subscribe(setLibraryData), [updates]);

  return h(WindowScreen, {}, [
    libraryData && [
      h(RoomStateEditor, { libraryData, client, gamePage, roomPage }),
    ],
  ]);
}