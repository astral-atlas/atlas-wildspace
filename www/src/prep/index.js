// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { useAPI } from "../../hooks/api";
import { useURLParam } from "../../hooks/navigation";
import { PrepLibrary, useAsync, useGameConnection, useGameData } from "@astral-atlas/wildspace-components"
import { h } from "@lukekaalim/act"
import { useStoredValue } from "../../hooks/storage";
import { identityStore } from "../../lib/storage";

export const PrepPage/*: Component<>*/ = () => {
  const [gameId, setGameId] = useURLParam('gameId');
  const [identity] = useStoredValue(identityStore);

  if (!gameId || !identity)
    return 'ERROR (GAMEID)';

  const api = useAPI();
  const [ut, wikiCon, conId] = useGameConnection(api, gameId);
  const [game] = useAsync(async () => api.game.read(gameId), [gameId, api]);

  if (!game)
    return 'ERROR (GAME)'

  const gameData = useGameData(game, identity.proof.userId, ut, api);

  return h(PrepLibrary, { gameData, client: api });
}