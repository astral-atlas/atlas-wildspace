// @flow strict
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type { WildspaceController, GameRoute } from "@astral-atlas/wildspace-components";
import type { GameID, GamePage, Game } from "@astral-atlas/wildspace-models";
import type { UpdatesConnection } from "@astral-atlas/wildspace-client2";
*/

import { useEffect, useState } from "@lukekaalim/act";
import { useGamePage, useUpdates } from "../updates";

/*::
export type GameScreenType = 'main' | 'prep';
export type GameController = {
  ...WildspaceController,

  userId: UserID,
  games: $ReadOnlyArray<Game>,
  gamePage: GamePage,
  selectedGame: Game,
  updates: UpdatesConnection,
};
*/

export const useGameController = (
  route/*: GameRoute*/,
  wildspace/*: WildspaceController*/,
  userId/*: UserID*/,
)/*: ?GameController*/ => {
  const [games, setGames] = useState(null);
  useEffect(() => {
    wildspace.client.game.list()
      .then(setGames)
  }, [wildspace])

  const selectedGame = games && (games.find(game => game.id === route.gameId) || games[0]);

  const updates = useUpdates(wildspace.client, selectedGame && selectedGame.id || null)
  const gamePage = useGamePage(updates);

  return updates && games && gamePage && selectedGame && {
    ...wildspace,
    updates,
    userId,
    
    gamePage,
    selectedGame,
    games,
  }
};