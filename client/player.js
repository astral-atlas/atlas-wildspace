// @flow strict
/*:: import type { Player, PlayerID } from '@astral-atlas/wildspace-models'; */
/*:: import type { RESTClient } from './rest'; */

const { toPlayer } = require("@astral-atlas/wildspace-models");

/*::
type PlayerClient = {
  get: (id: PlayerID) => Promise<Player>,
  create: (name: string) => Promise<Player>,
};

export type {
  PlayerClient,
};
*/

const createPlayerClient = (rest/*: RESTClient*/)/*: PlayerClient*/ => {
  const getPlayer = async (playerId) => {
    const { content } = await rest.get({ resource: '/player', params: { playerId } });
    const player = toPlayer(content);
    return player;
  };
  const createPlayer = async (name) => {
    const requestContent = {
      name,
    };
    const { content } = await rest.post({ resource: '/player', content: requestContent });
    const player = toPlayer(content);
    return player;
  };

  return {
    get: getPlayer,
    create: createPlayer,
  }
};

module.exports = {
  createPlayerClient,
};
