// @flow strict
/*:: import type {
  Game, GameID, PlayerID, Player, Character, CharacterID, GameMasterID, GameMaster,
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
/*:: import type { AudioService } from './services/audio'; */
/*:: import type { Table } from './services/table'; */
/*:: import type { AssetServices } from './services/asset'; */
/*:: import type { Tables } from './tables'; */

const { createAuthService } = require('./services/auth');
const { createMemoryStore } = require('./services/store');
const { createGameService } = require('./services/game');
const { createPlayerService } = require('./services/player');
const { createCharacterService } = require('./services/character');
const { createAudioService } = require('./services/audio');
const { createAssetServices } = require('./services/asset');

const { createTables } = require('./tables');


/*::
type Services = {
  auth: AuthService,
  games: GameService,
  players: PlayerService,
  stores: Stores,
  character: CharacterService,
  audio: AudioService,
  asset: AssetServices,
  tables: Tables,
};

type Stores = {
  game: MemoryStore<GameID, Game>,
  player: MemoryStore<PlayerID, Player>,
  playerSecrets: MemoryStore<PlayerID, { secret: string }>,
  character: MemoryStore<CharacterID, Character>,
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

  return {
    game,
    player,
    character,
    playerSecrets,
  };
};

const createServices = async ()/*: Promise<Services>*/ => {
  const stores = createStores();
  const tables = await createTables();

  const auth = createAuthService(stores.player, stores.playerSecrets);
  const players = createPlayerService(stores.player);
  const games = createGameService(tables, players);
  const character = createCharacterService(stores.character);
  const asset = createAssetServices(tables);
  const audio = createAudioService(tables, games, asset);

  return {
    tables,
    stores,
    auth,
    games,
    players,
    character,
    audio,
    asset,
  };
}

module.exports = {
  createServices,
};
