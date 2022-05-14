// @flow strict
/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { UserID } from "@astral-atlas/sesame-models"; */
/*:: import type { GameID, Game, GameUpdate } from "@astral-atlas/wildspace-models"; */
/*:: import type { AssetClient } from './asset.js'; */
/*:: import type { HTTPServiceClient, WSServiceClient } from './wildspace.js'; */

/*:: import type { CharacterClient } from './game/characters.js'; */
/*:: import type { PlayersClient } from './game/players.js'; */
/*:: import type { EncounterClient } from './game/encounter.js'; */

import { gameAPI } from "@astral-atlas/wildspace-models";
import { createCharacterClient } from './game/characters.js';
import { createPlayersClient } from './game/players.js';
import { createEncounterClient } from './game/encounter.js';
import { createSceneClient } from './game/scene.js';
import { createLocationClient } from "./game/locations.js";
import { createMagicItemClient } from "./game/magicItem.js";
import { createWikiConnectionManager, createWikidocClient } from "./game/wiki.js";

/*::
import type { WikiDocID, WikiDocEvent, WikiDocAction, GameConnectionID } from '@astral-atlas/wildspace-models';
import type { SceneClient } from "./game/scene";
import type { LocationClient } from "./game/locations";
import type { MagicItemClient } from "./game/magicItem";
import type { WikiConnectionClient, WikidocClient } from "./game/wiki";

export type GameClient = {
  read: (gameId: GameID) => Promise<Game>,
  list: () => Promise<$ReadOnlyArray<Game>>,
  create: (name: string) => Promise<Game>,

  update: (gameId: GameID, updatedGame: { name?: string }) => Promise<void>,
  connectUpdates: (
    gameId: GameID,
    onUpdate: (state: GameUpdate) => mixed,
    onConnected?: (connectionId: GameConnectionID) => mixed,
  ) => Promise<{ wiki: WikiConnectionClient, socket: WebSocket, close: () => void }>,

  character: CharacterClient,
  players: PlayersClient,
  encounter: EncounterClient,
  scene: SceneClient,
  location: LocationClient,
  magicItem: MagicItemClient,
  wiki: WikidocClient,
};

export * from './game/wiki';
*/

export const createGameClient = (http/*: HTTPServiceClient*/, ws/*: WSServiceClient*/)/*: GameClient*/ => {
  const gameResource = http.createResource(gameAPI['/games']);
  const allGamesResource = http.createResource(gameAPI['/games/all']);
  const updates = ws.createAuthorizedConnection(gameAPI['/games/updates']);

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
  const connectUpdates = async (gameId, onUpdate, onConnected) => {

    const recieve = (event) => {
      switch (event.type) {
        case 'connected':
          return onConnected && onConnected(event.connectionId);
        case 'wiki':
          return wikiManager.recieve(event.event);
        case 'updated':
          return onUpdate(event.update);
      }
    };
    const wikiManager = createWikiConnectionManager(action => connection.send({ type: 'wiki', action }));
    const connection = await updates.connect({ query: { gameId }, recieve: e => void recieve(e) });


    const close = () => {
      connection.close()
    };

    return { close, socket: connection.socket, wiki: wikiManager.client };
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
    scene: createSceneClient(http),
    location: createLocationClient(http),
    magicItem: createMagicItemClient(http),
    wiki: createWikidocClient(http),
  };
}