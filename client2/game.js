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
import { createWikiDocClient } from "./game/wiki.js";
import { createGameUpdatesClient } from "./game/updates.js";
import { createMiniTheaterClient } from "./game/miniTheater.js";
import { createLibraryClient } from "./game/library";
import { createExpositionClient } from "./game/exposition.js";
import { createMonsterClient } from "./game/monsters.js";

/*::
import type { WikiDocID, WikiDocEvent, WikiDocAction, GameConnectionID } from '@astral-atlas/wildspace-models';
import type { SceneClient } from "./game/scene";
import type { LocationClient } from "./game/locations";
import type { MagicItemClient } from "./game/magicItem";
import type { WikiDocClient } from "./game/wiki";
import type { GameUpdatesConnectionClient, GameUpdatesConnection } from "./game/updates";
import type { MiniTheaterClient } from "./game/miniTheater";
import type { LibraryClient } from "./game/library";
import type { ExpositionClient } from "./game/exposition";
import type { MonsterClient } from "./game/monsters";

export type GameClient = {
  read: (gameId: GameID) => Promise<Game>,
  list: () => Promise<$ReadOnlyArray<Game>>,
  create: (name: string) => Promise<Game>,

  update: (gameId: GameID, updatedGame: { name?: string }) => Promise<void>,

  character: CharacterClient,
  players: PlayersClient,
  encounter: EncounterClient,
  exposition: ExpositionClient,
  scene: SceneClient,
  location: LocationClient,
  magicItem: MagicItemClient,
  wiki: WikiDocClient,
  miniTheater: MiniTheaterClient,
  updates: GameUpdatesConnectionClient,
  library: LibraryClient,
  monster: MonsterClient
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

  const library = createLibraryClient(http);
  const miniTheater = createMiniTheaterClient(http);
  const wiki = createWikiDocClient(http);

  return {
    read,
    list,
    create,
    update,
    
    character: createCharacterClient(http),
    players: createPlayersClient(http),
    encounter: createEncounterClient(http),
    scene: createSceneClient(http),
    exposition: createExpositionClient(http),
    location: createLocationClient(http),
    magicItem: createMagicItemClient(http),
    wiki,
    monster: createMonsterClient(http),
    updates: createGameUpdatesClient(http, ws, wiki, library, miniTheater),
    miniTheater,
    library,
  };
}

export * from './game/meta.js';
export * from './game/updates.js';
