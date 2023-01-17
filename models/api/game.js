// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID, Game, GameUpdate, GameMaster, Player } from '../game.js'; */
/*:: import type { CharacterID, MonsterID, Character, Monster } from '../character.js'; */
/*:: import type { CharactersAPI } from './game/characters.js'; */
/*:: import type { PlayersAPI } from './game/players.js'; */
/*:: import type { MonstersAPI } from "./game/monsters.js"; */
/*:: import type { EncounterAPI } from "./game/encounters.js"; */
/*::
import type { MagicItemAPI } from "./game/magicItem";
import type { WikiDocEvent, WikiDocAction} from "../game.js";
import type { AuthorizedConnection } from "./meta";
import type { GameConnectionID } from "../game/connection";
import type { InitiativeAPI } from "./game/initiative";
import type { MiniTheaterAPI } from "./game/miniTheater";
import type { AdvancedUpdatesAPI } from "./game/advancedUpdates";
import type { ScenesAPI } from "./game/scene";
import type { LibraryAPI } from './game/library';
import type { GameRoomsAPI } from "./game/rooms";
import type { GameResourceAPI } from "./game/resource";
import type { TagAPI } from "./game/tag";
*/

import {
  createObjectCaster as obj, castString as str,
  createConstantCaster as lit, createArrayCaster as arr,
  createNullableCaster as maybe,
  c,
} from '@lukekaalim/cast';

import { castGameId, castGame, castGameUpdate, castGameConnectionId, } from '../game.js';
import { charactersAPI } from './game/characters.js';
import { playersAPI } from './game/players.js';
import { monstersAPI } from './game/monsters.js';
import { encountersAPI } from './game/encounters.js';
import { magicItemAPI } from './game/magicItem.js';
import { miniTheaterAPI } from './game/miniTheater.js';
import { initiativeAPI } from './game/initiative.js';
import { advancedUpdatesAPI } from "./game/advancedUpdates.js";

import { castWikiDocAction, castWikiDocEvent } from "../game.js";
import { wikiAPI } from './game/wiki.js';
import { createAuthorizedConnectionDescription } from './meta.js';
import { scenesAPI } from "./game/scene.js";
import { libraryAPI } from "./game/library.js";
import { gamesRoomsAPI } from './game/rooms.js';
import { resourceAPI } from "./game/resource.js";
import { tagResourceSpec, tagsResourceSpecs } from './game/tag.js';

/*::
export type GameAPI = {
  '/games': {|
    GET: {
      query: { gameId: GameID },
      request: empty,
      response: { type: 'found', game: Game },
    },
    POST: {
      query: empty,
      request: { name: string },
      response: { type: 'created', game: Game },
    },
    PUT: {
      query: { gameId: GameID },
      request: { name: ?string },
      response: { type: 'updated' },
    }
  |},
  '/games/updates': AuthorizedConnection<{|
    query: { gameId: GameID },
    client:
      | {| type: 'wiki', action: WikiDocAction |},
    server:
      | {| type: 'updated', update: GameUpdate |}
      | {| type: 'connected', connectionId: GameConnectionID |}
      | {| type: 'wiki', event: WikiDocEvent |},
  |}>,
  ...CharactersAPI,
  ...MonstersAPI,
  ...EncounterAPI,
  ...PlayersAPI,
  '/games/all': {|
    GET: {
      query: empty,
      request: empty,
      response: { type: 'found', games: $ReadOnlyArray<Game> },
    },
  |},
  ...ScenesAPI,
  ...MagicItemAPI,
  ...InitiativeAPI,
  ...MiniTheaterAPI,
  ...AdvancedUpdatesAPI,
  ...LibraryAPI,
  ...GameRoomsAPI,
  ...GameResourceAPI,
  ...TagAPI,
};
*/

export const gameResourceDescription/*: ResourceDescription<GameAPI['/games']>*/ = {
  path: '/games',

  GET: {
    toQuery: obj({ gameId: castGameId }),
    toResponseBody: obj({ type: lit('found'), game: castGame }),
  },
  POST: {
    toRequestBody: obj({ name: str }),
    toResponseBody: obj({ type: lit('created'), game: castGame }),
  },
  PUT: {
    toQuery: obj({ gameId: castGameId }),
    toRequestBody: obj({ name: maybe(str) }),
    toResponseBody: obj({ type: lit('updated') }),
  },
};

export const gameStateConnectionDescription/*: ConnectionDescription<GameAPI['/games/updates']>*/ = createAuthorizedConnectionDescription({
  path: '/games/updates',
  subprotocol: 'JSON.wildspace.game_updates.v1.0.0',

  castQuery: c.obj({ gameId: castGameId }),
  castClientMessage: c.or('type', {
    'wiki': c.obj({ type: c.lit('wiki'), action: castWikiDocAction })
  }),
  castServerMessage:  c.or('type', {
    'updated': c.obj({ type: c.lit('updated'), update: castGameUpdate }),
    'connected': c.obj({ type: c.lit('connected'), connectionId: castGameConnectionId }),
    'wiki': c.obj({ type: c.lit('wiki'), event: castWikiDocEvent }),
  })
});

export const allGamesResourceDescription/*: ResourceDescription<GameAPI['/games/all']>*/ = {
  path: '/games/all',

  GET: {
    toResponseBody: obj({ type: lit('found'), games: arr(castGame) }),
  },
};

export const gameAPI = {
  ...charactersAPI,
  ...playersAPI,
  ...monstersAPI,
  ...encountersAPI,
  ...magicItemAPI,
  ...wikiAPI,
  ...miniTheaterAPI,
  ...scenesAPI,
  ...initiativeAPI,
  ...advancedUpdatesAPI,
  ...libraryAPI,
  ...gamesRoomsAPI,
  ...resourceAPI,
  '/games': gameResourceDescription,
  '/games/all': allGamesResourceDescription,
  '/games/updates': gameStateConnectionDescription,
}
export const gameResourceSpec = {
  ...tagsResourceSpecs,
};
export * from './game/characters.js';
export * from './game/players.js';
export * from './game/monsters.js';
export * from './game/encounters.js';
export * from './game/scene.js';
export * from './game/location.js';
export * from './game/magicItem.js';
export * from './game/wiki.js';
export * from './game/meta.js';
export * from './game/initiative.js';
export * from './game/miniTheater.js';
export * from './game/advancedUpdates.js';