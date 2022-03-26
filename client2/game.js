// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { UserID } from "@astral-atlas/sesame-models"; */
/*:: import type { GameID, Game, GameUpdate } from "@astral-atlas/wildspace-models"; */
/*:: import type { AssetClient } from './asset.js'; */
/*:: import type { HTTPServiceClient, WSServiceClient } from './wildspace.js'; */

/*:: import type { CharacterClient } from './game/characters.js'; */
/*:: import type { PlayersClient } from './game/players.js'; */
/*:: import type { EncounterClient } from './game/encounter.js'; */

import { createJSONResourceClient } from '@lukekaalim/http-client';
import { createJSONConnectionClient } from '@lukekaalim/ws-client';

import { gameAPI } from "@astral-atlas/wildspace-models";
import { createCharacterClient } from './game/characters.js';
import { createPlayersClient } from './game/players.js';
import { createEncounterClient } from './game/encounter.js';

/*::
export type GameClient = {
  read: (gameId: GameID) => Promise<Game>,
  list: () => Promise<$ReadOnlyArray<Game>>,
  create: (name: string) => Promise<Game>,

  update: (gameId: GameID, updatedGame: { name?: string }) => Promise<void>,
  connectUpdates: (gameId: GameID, onUpdate: (state: GameUpdate) => mixed) => { close: () => Promise<void> },

  character: CharacterClient,
  players: PlayersClient,
  encounter: EncounterClient,
};
*/

export const createGameClient = (http/*: HTTPServiceClient*/, ws/*: WSServiceClient*/)/*: GameClient*/ => {
  const gameResource = http.createResource(gameAPI['/games']);
  const allGamesResource = http.createResource(gameAPI['/games/all']);
  const updates = ws.createConnection(gameAPI['/games/updates']);

  const read = async (gameId) => {
    const { body: { game } } = await gameResource.GET({ query: { gameId }});
    return game;
  }
  const list = async () => {
    const { body: { games } } = await allGamesResource.GET();
    return games;
  }
  const create = async (name) => {
    const { body: { game } } = await gameResource.POST({ body: { name }});
    return game;
  }
  const update = async (gameId, { name = null, }) => {
    await gameResource.PUT({ query: { gameId },  body: { name }});
  }
  const connectUpdates = (gameId, onUpdate) => {
    const recieve = (event) => {
      onUpdate(event.update);
    };
    const connectionPromise = updates.connect({ query: { gameId }, recieve });

    const close = async () => {
      const { close } = await connectionPromise;
      close();
    };

    return { close };
  }

  return {
    read,
    list,
    create,
    update,
    connectUpdates,
    
    character: createCharacterClient(http),
    players: createPlayersClient(http),
    encounter: createEncounterClient(http),
  };
}