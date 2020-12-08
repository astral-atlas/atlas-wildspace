// @flow strict
/*:: import type {
  Game, GameID, PlayerID, Player, Character, CharacterID, GameMasterID, GameMaster,
  HTTPAudioSourceID, HTTPAudioSource,
  BackgroundAudioTrackID, BackgroundAudioTrack,
} from '@astral-atlas/wildspace-models'; */
/*:: import type { AuthService } from './services/auth'; */
/*:: import type { StoreService, IndexService, MemoryStore } from './services/store'; */
/*:: import type { GameService } from './services/game'; */
/*:: import type { PlayerService } from './services/player'; */
/*:: import type { CharacterService } from './services/character'; */
/*:: import type { AudioService, TrackState } from './services/audio'; */
const { createAuthService } = require('./services/auth');
const { createMemoryStore } = require('./services/store');
const { createGameService } = require('./services/game');
const { createPlayerService } = require('./services/player');
const { createCharacterService } = require('./services/character');
const { createAudioService } = require('./services/audio');

/*::
type Services = {
  auth: AuthService,
  games: GameService,
  players: PlayerService,
  stores: Stores,
  character: CharacterService,
  audio: AudioService,
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

const createServices = ()/*: Services*/ => {
  const stores = createStores();

  const auth = createAuthService(stores.player, stores.playerSecrets);
  const players = createPlayerService(stores.player);
  const games = createGameService(stores.game, players);
  const character = createCharacterService(stores.character);
  const audio = createAudioService(stores.tracks, stores.sources, stores.activeTrackStates);

  return {
    stores,
    auth,
    games,
    players,
    character,
    audio,
  };
}

module.exports = {
  createServices,
};
