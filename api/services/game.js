// @flow strict
/*::
import type { UserID } from '@astral-atlas/sesame-models';
import type { Game, GameID, Player, GamePage } from '@astral-atlas/wildspace-models';
import type { WildspaceData } from '@astral-atlas/wildspace-data';
import type { AuthService, Identity } from "./auth.js";
import type { GameConnectionService } from "./game/connection";
import type { RoomService } from "./room";
import type { AssetService } from "./asset";
*/
import { createMaskForMonsterActor } from '@astral-atlas/wildspace-models';
import { v4 as uuid } from 'uuid';
import { createGameConnectionService } from "./game/connection.js";

/*::
export type GameService = {
  createScopeAssertion: (scope: GameIdentityScope) => { assertWithinScope: (gameId: GameID, authorizer: Identity) => Promise<{ game: Game }> },

  create: (name: string, authorizer: Identity) => Promise<Game>,
  update: (gameId: GameID, name: ?string, authorizer: Identity) => Promise<void>,
  get: (gameId: GameID, authorizer: Identity) => Promise<Game>,
  all: (authorizer: Identity) => Promise<Game[]>,

  listPlayers: (gameId: GameID, authorizer: Identity) => Promise<Player[]>,
  addPlayer: (gameId: GameID, playerId: UserID, authorizer: Identity) => Promise<void>,
  removePlayer: (gameId: GameID, playerId: UserID, authorizer: Identity) => Promise<void>,

  getGamePage: (gameId: GameID, authorizer: Identity) => Promise<?GamePage>,

  connection: GameConnectionService,
};

export type GameIdentityScope =
  | { type: 'guest' } // accept anyone (expect those with corruped credentials)
  | { type: 'user' } // accept anyone wth a sesame accoutn
  | { type: 'player-in-game' } // accept anyone
  | { type: 'game-master-in-game' }

*/

export const createGameService = (
  data/*: WildspaceData*/,
  auth/*: AuthService*/,
  asset/*: AssetService*/,
)/*: GameService*/ => {
  const create = async (name, authorizer) => {
    if (authorizer.type === 'guest')
      throw new Error();
    
    const game = {
      id: uuid(),
      name,
      gameMasterId: authorizer.grant.identity,
    };
    await data.gamePlayers.set(game.id, game.gameMasterId, { joined: true, userId: game.gameMasterId });
    await data.gameParticipation.set(game.gameMasterId, game.id, { joined: true, gameId: game.id });
    await data.game.set(game.id, game);

    return game;
  };
  const update = async (gameId, name, authorizer) => {
    const { game: prevGame } = await assertGameMasterInGame(gameId, authorizer);

    const nextGame = {
      ...prevGame,
      name: name || prevGame.name,
    };
    await data.game.set(nextGame.id, nextGame);
  };
  const get = async (gameId, authorizer) => {
    const { game } = await assertPlayerInGame(gameId, authorizer);
    return game;
  };
  const all = async (authorizer) => {
    if (authorizer.type === 'guest')
      throw new Error();
    const { result: participations } = await data.gameParticipation.query(authorizer.grant.identity);

    const gameRequest = await Promise.all(participations.filter(p => p.joined).map(p => data.game.get(p.gameId)));
    const games = gameRequest.map(g => g.result).filter(Boolean);
    return games;
  };

  const assertGuest = async (gameId) => {
    const { result: game } = await data.game.get(gameId);
    if (!game)
      throw new Error(`No Game!`);
    return { game };
  };
  const assertUser = async (gameId, identity) => {
    const { game } = await assertGuest(gameId);
    if (identity.type !== 'link')
      throw new Error();
    return { game, linkIdentity: identity };
  }
  const assertPlayerInGame = async (gameId, identity) => {
    const { game, linkIdentity } = await assertUser(gameId, identity); 

    const { result: participation } = await data.gamePlayers.get(gameId, linkIdentity.grant.identity);
    if (!participation || !participation.joined)
      throw new Error();
    return { game, linkIdentity, participation };
  }
  const assertGameMasterInGame = async(gameId, identity) => {
    const { game, linkIdentity } = await assertUser(gameId, identity);
    if (game.gameMasterId !== linkIdentity.grant.identity)
      throw new Error();
    return { game, linkIdentity };
  }

  const createScopeAssertion = (scope) => {
    switch (scope.type) {
      case 'guest':
        return { assertWithinScope: assertGuest };
      case 'user':
        return { assertWithinScope: assertUser };
      case 'player-in-game':
        return { assertWithinScope: assertPlayerInGame };
      case 'game-master-in-game':
        return { assertWithinScope: assertGameMasterInGame };
      default:
        throw new Error();
    }
  };

  const addPlayer = async (gameId, playerId, authorizer) => {
    const { game } = await assertGameMasterInGame(gameId, authorizer);

    await data.gamePlayers.set(game.id, playerId, { joined: true, userId: playerId });
    await data.gameParticipation.set(playerId, game.id, { joined: true, gameId: game.id });
  };
  const listPlayers = async (gameId, authorizer) => {
    const { game } = await assertPlayerInGame(gameId, authorizer);
    const { result: playerParticipations } = await data.gamePlayers.query(game.id);

    const users = await Promise.all(playerParticipations
      .filter(p => p.joined)
      .map(async p => {
        try {
          return await auth.sdk.getUser(p.userId)
        } catch (error) {
          return null;
        }
      }));

    return users.filter(Boolean).map(u => ({ type: 'player', userId: u.id, name: u.name, gameId: game.id }));
  };
  const removePlayer = async (gameId, playerId, authorizer) => {
    const { game } = await assertGameMasterInGame(gameId, authorizer);

    await data.gamePlayers.set(game.id, playerId, { joined: false, userId: playerId });
    await data.gameParticipation.set(playerId, game.id, { joined: false, gameId: game.id });
  }

  const getGamePage = async (gameId, identity) => {
    const [
      { result: game },
      players,
      { result: monsters },
      { result: characters },
      { result: monsterActors },
      { result: magicItems },
      { result: wikiDocs },
      { result: rooms },
      { result: roomLobbyData, },
    ] = await Promise.all([
      data.game.get(gameId),
      listPlayers(gameId, identity),
      data.monsters.query(gameId),
      data.characters.query(gameId),
      data.gameData.monsterActors.query(gameId),
      data.gameData.magicItems.query(gameId),
      data.wiki.documents.query(gameId),
      data.room.query(gameId),
      data.roomData.lobby.query(gameId),
    ]);
    if (!game)
      return null;


    const monsterMap = new Map(monsters.map(m => [m.id, m]));
    const monsterMasks = monsterActors.map(actor => {
      const monster = monsterMap.get(actor.monsterId);
      return monster && createMaskForMonsterActor(monster, actor);
    }).filter(Boolean);

    const assets = [
      ...(await Promise.all(characters
        .map(character => character.initiativeIconAssetId)
        .filter(Boolean)
        .map(assetId => asset.peek(assetId))
      )),
      ...(await Promise.all(monsters
        .map(monster => monster.initiativeIconAssetId)
        .filter(Boolean)
        .map(assetId => asset.peek(assetId))
      )),
    ].filter(Boolean);

    const roomLobbies = roomLobbyData.map((lobbyData) => [lobbyData.roomId, lobbyData.state]);

    const gamePage = {
      game,

      players,
      characters,
      monsterMasks,

      magicItems,
      wikiDocs,

      rooms,
      roomLobbies,

      assets,
    };
    return gamePage;
  }

  const connection = createGameConnectionService(data);

  return {
    create, update, get, all, createScopeAssertion, removePlayer, addPlayer, listPlayers,
    getGamePage,
    connection,
  };
};
