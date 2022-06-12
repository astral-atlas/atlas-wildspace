// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { useAPI } from "../../hooks/api";
import { useURLParam } from "../../hooks/navigation";
import { PrepLibrary, useAsync, useGameConnection, useGameData } from "@astral-atlas/wildspace-components"
import { h, useEffect, useRef, useState } from "@lukekaalim/act"
import { useStoredValue } from "../../hooks/storage";
import { identityStore } from "../../lib/storage";
import { useAppSetup } from "../useAppSetup";
import { useRootNavigation } from "@lukekaalim/act-navigation";

export const PrepPage/*: Component<>*/ = () => {
  const navigation = useRootNavigation();
  const [gameId, setGameId] = useURLParam('gameId', navigation);
  const setup = useAppSetup();

  const [conTime, setConTime] = useState(Date.now());
  const [updates] = useAsync(async () => gameId && setup && setup.client.game.updates.create(gameId), [gameId, setup, conTime])
  const [game] = useAsync(async () => gameId && setup && setup.client.game.read(gameId), [gameId, setup]);

  const assets = new Map();

  return [
    !!setup && !!updates && !!game &&
      h(PrepLibrary, { updates, client: setup.client, userId: setup.proof?.userId, assets, game })
  ];
}