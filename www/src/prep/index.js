// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { useAPI } from "../../hooks/api";
import { useURLParam } from "../../hooks/navigation";
import { PlayerPrepLibrary, useAsync, useGameConnection, useGameData } from "@astral-atlas/wildspace-components"
import { h, useEffect, useRef, useState } from "@lukekaalim/act"
import { useStoredValue } from "../../hooks/storage";
import { identityStore } from "../../lib/storage";
import { useAppSetup } from "../useAppSetup";
import { useRootNavigation } from "@lukekaalim/act-navigation";

const ROOM_ID = `3d1cdcc3-5548-4033-a949-bf7ac35284fa`;
const GAME_ID = "af20ee19-be0b-49e7-a9e7-fd03479be915";

export const PrepPage/*: Component<>*/ = () => {
  const navigation = useRootNavigation();
  const [gameId, setGameId] = useURLParam('gameId', navigation);
  const setup = useAppSetup();


  const [conTime, setConTime] = useState(Date.now());
  const [updates] = useAsync(async () => setup && gameId && setup.client.game.updates.create(gameId), [gameId, setup, conTime])
  const [game] = useAsync(async () => setup && gameId && setup.client.game.read(gameId), [gameId, setup]);

  console.log(game);

  const [roomPage, setRoomPage] = useState(null);
  useEffect(() => {
    if (!updates)
      return;
    updates.roomPage.subscribe(ROOM_ID, setRoomPage);
  }, [updates]);

  const assets = new Map();

  return [
    !!setup && !!updates && !!game &&
      h(PlayerPrepLibrary, { updates, client: setup.client, userId: setup.proof?.userId, assets, game })
  ];
}