// @flow strict

import { useLibraryData } from "../../updates";
import { GameMasterPrepLibrary } from "@astral-atlas/wildspace-components"
import { h } from "@lukekaalim/act"
import { WindowScreen } from "./WindowScreen";

export const RoomLibraryScreen = ({ roomController }) => {
  const { userId, client, updates, gamePage: { game} } = roomController;

  const data = useLibraryData(updates)

  return h(WindowScreen, {}, data &&
    h(GameMasterPrepLibrary, { client, data, game, userId }))
}