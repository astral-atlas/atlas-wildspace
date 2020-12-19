// @flow strict
/*:: import type { AssetTables } from './tables/assets'; */
/*:: import type { GameTables } from './tables/game'; */
/*:: import type { AudioTables } from './tables/audio'; */

const { createAssetTables } = require('./tables/assets');
const { createGameTables } = require('./tables/game');
const { createAudioTables } = require('./tables/audio');

/*::
export type Tables = {
  asset: AssetTables,
  game: GameTables,
  audio: AudioTables,
};
*/

const createTables = async ()/*: Promise<Tables>*/ => {
  const asset = await createAssetTables();
  const game = await createGameTables();
  const audio = await createAudioTables();
  
  return {
    asset,
    game,
    audio,
  };
};

module.exports = {
  createTables,
};
