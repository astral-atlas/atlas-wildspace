// @flow strict
/*:: import type {
  Game, GameID, PlayerID, Player, Character, CharacterID, GameMasterID, GameMaster,
  HTTPAudioSourceID, HTTPAudioSource,
  BackgroundAudioTrackID, BackgroundAudioTrack,
  ActiveTrackRow,
  AudioAsset, AudioAssetID,
  Asset, AssetID, AssetURL,
} from '@astral-atlas/wildspace-models'; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { AuthService } from './services/auth'; */
/*:: import type { StoreService, IndexService, MemoryStore } from './services/store'; */
/*:: import type { GameService } from './services/game'; */
/*:: import type { PlayerService } from './services/player'; */
/*:: import type { CharacterService } from './services/character'; */
/*:: import type { AudioService, TrackState } from './services/audio'; */
/*:: import type { Table } from './services/table'; */
/*:: import type { AssetService } from './services/asset'; */
/*:: import type { Tables } from './tables'; */

const { createAuthService } = require('./services/auth');
const { createMemoryStore } = require('./services/store');
const { createGameService } = require('./services/game');
const { createPlayerService } = require('./services/player');
const { createCharacterService } = require('./services/character');
const { createAudioService } = require('./services/audio');
const { createMemoryAssetService } = require('./services/asset');

const { createTables } = require('./tables');


/*::
type Services = {
  auth: AuthService,
  games: GameService,
  players: PlayerService,
  stores: Stores,
  character: CharacterService,
  audio: AudioService,
  assets: AssetService,
  tables: Tables,
};

type Stores = {
  game: MemoryStore<GameID, Game>,
  player: MemoryStore<PlayerID, Player>,
  playerSecrets: MemoryStore<PlayerID, { secret: string }>,
  character: MemoryStore<CharacterID, Character>,

  sources: MemoryStore<HTTPAudioSourceID, HTTPAudioSource>,
  tracks: MemoryStore<BackgroundAudioTrackID, BackgroundAudioTrack>,
  activeTrackStates: MemoryStore<GameID, TrackState>,
};

export type {
  AuthService,
  Services,
  Stores,
};
*/

const createStores = ()/*: Stores*/ => {
  const game = createMemoryStore/*:: <GameID, Game>*/();
  const player = createMemoryStore/*:: <PlayerID, Player>*/();
  const character = createMemoryStore/*:: <CharacterID, Character>*/();
  const playerSecrets = createMemoryStore/*::<PlayerID, { secret: string }>*/();

  const sources = createMemoryStore/*::<HTTPAudioSourceID, HTTPAudioSource>*/();
  const tracks = createMemoryStore/*::<BackgroundAudioTrackID, BackgroundAudioTrack>*/();
  const activeTrackStates = createMemoryStore/*::<GameID, TrackState>*/();

  return {
    game,
    player,
    character,
    playerSecrets,

    sources,
    tracks,
    activeTrackStates,
  };
};

const createServices = async ()/*: Promise<Services>*/ => {
  const stores = createStores();
  const tables = await createTables();

  const auth = createAuthService(stores.player, stores.playerSecrets);
  const players = createPlayerService(stores.player);
  const games = createGameService(tables, players);
  const character = createCharacterService(stores.character);
  const audio = createAudioService(stores.tracks, stores.sources, stores.activeTrackStates);
  const assets = createMemoryAssetService();

  return {
    tables,
    stores,
    auth,
    games,
    players,
    character,
    audio,
    assets,
  };
}

module.exports = {
  createServices,
};
