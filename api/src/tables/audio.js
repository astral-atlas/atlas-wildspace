// @flow strict
/*:: import type { BackgroundAudioTrackID, GameID, AudioAssetID } from '@astral-atlas/wildspace-models'; */
/*:: import type { ReadWriteTable, Selectable } from '@astral-atlas/table'; */
/*:: import type { ActiveTrackRow } from '@astral-atlas/wildspace-models'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { AssetTables } from './assets'; */
const { createFileTable } = require('@astral-atlas/table');
const { toActiveTrackRow, toBackgroundAudioTrackID, toGameID, toAudioAssetId } = require('@astral-atlas/wildspace-models');
const { toObject, toString } = require('@lukekaalim/cast');

/*::
export type BackgroundAudioTrackRow = {|
  id: BackgroundAudioTrackID,
  name: string,
  gameId: GameID,
  audioAssetId: AudioAssetID,
|}

export type AudioTables = {
  backgroundTracks: ReadWriteTable<BackgroundAudioTrackRow>,
  activeTracks: ReadWriteTable<ActiveTrackRow>,
};
*/
const toBackgroundAudioTrackRow/*: Cast<BackgroundAudioTrackRow>*/ = (value) => {
  const object = toObject(value);
  return {
    id: toBackgroundAudioTrackID(object.id),
    name: toString(object.name),
    gameId: toGameID(object.gameId),
    audioAssetId: toAudioAssetId(object.audioAssetId),
  }
};

const createAudioTables = async ()/*: Promise<AudioTables>*/ => {
  const backgroundTracks = await createFileTable('backgroundTracks', './data/audio/backgroundTracks.json', toBackgroundAudioTrackRow);
  const activeTracks = await createFileTable('audioAssets', './data/games/tracks.json', toActiveTrackRow);

  return {
    backgroundTracks,
    activeTracks,
  };
};

module.exports = {
  createAudioTables,
};
