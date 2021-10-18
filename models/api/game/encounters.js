// @flow strict
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
/*:: import type { ResourceDescription, ConnectionDescription } from "@lukekaalim/net-description"; */
/*:: import type { GameID, Game, GameMaster, Player } from '../../game.js'; */
/*:: import type { EncounterID, Encounter } from '../../encounter.js'; */

import { c } from '@lukekaalim/cast';
import { castGameId } from '../../game.js';
import { castEncounter, castEncounterId } from "../../encounter.js";

/*::
export type EncounterAPI = {|
  '/games/encounters': {|
    GET: {
      query: { gameId: GameID },
      request: empty,
      response: { type: 'found', encounters: $ReadOnlyArray<Encounter> },
    },
    POST: {
      query: empty,
      request: { gameId: GameID, name: string },
      response: { type: 'created', encounter: Encounter },
    },
    PUT: {
      query: { gameId: GameID, encounterId: EncounterID },
      request: { encounter: Encounter },
      response: { type: 'updated' },
    },
    DELETE: {
      query: { gameId: GameID, encounterId: EncounterID },
      request: empty,
      response: { type: 'deleted' },
    }
  |},
|};
*/

export const gameEncounters/*: ResourceDescription<EncounterAPI['/games/encounters']>*/ = {
  path: '/games/encounters',

  GET: {
    toQuery: c.obj({ gameId: castGameId }),
    toResponseBody: c.obj({ type: c.lit('found'), encounters: c.arr(castEncounter) }),
  },
  POST: {
    toRequestBody: c.obj({ gameId: castGameId, name: c.str }),
    toResponseBody: c.obj({ type: c.lit('created'), encounter: castEncounter }),
  },
  PUT: {
    toQuery: c.obj({ gameId: castGameId, encounterId: castEncounterId }),
    toRequestBody: c.obj({ encounter: castEncounter }),
    toResponseBody: c.obj({ type: c.lit('updated') }),
  },
  DELETE: {
    toQuery: c.obj({ gameId: castGameId, encounterId: castEncounterId }),
    toResponseBody: c.obj({ type: c.lit('deleted') }),
  },
};

export const encountersAPI = {
  '/games/encounters': gameEncounters,
};
