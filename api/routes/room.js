// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */
/*:: import type { GameIdentityScope } from "../services/game.js"; */
/*:: import type { Services } from "../services.js"; */
/*::
import type { RoutesConstructor } from '../routes.js';
*/

import { v4 as uuid } from 'uuid';
import { c } from "@lukekaalim/cast";
import { HTTP_STATUS } from "@lukekaalim/net-description";
import { createJSONResourceRoutes, createResourceRoutes } from "@lukekaalim/http-server";
import { createJSONConnectionRoute } from "@lukekaalim/ws-server";

import { encountersAPI, getRoundedMonsterHealthPercentage, reduceEncounterState, roomAPI } from '@astral-atlas/wildspace-models'; 
import * as m from '@astral-atlas/wildspace-models'; 
import { createMetaRoutes, defaultOptions } from './meta.js';
import { createStateRoutes } from './room/state.js';
import { createLobbyRoutes } from "./room/lobby.js";
import { createRoomSceneRoutes } from './room/scene.js';
import { createRoomPageRoutes } from "./room/page.js";

export const createRoomRoutes/*: RoutesConstructor*/ = (services) => {
  const { data, ...s } = services

  const { createAuthorizedResource } = createMetaRoutes({ ...s, data });

  const roomResourceRoutes = createAuthorizedResource(roomAPI['/room'], {
    ...defaultOptions,

    GET: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      handler: async ({ game, query: { roomId }}) => {
        const { result: room } = await data.room.get(game.id, roomId);
        if (!room)
          return { status: HTTP_STATUS.not_found };
        return { status: HTTP_STATUS.ok, body: { type: 'found', room } };
      }
    },
    POST: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.body.gameId,
      handler: async ({ game, body: { title } }) => {
        const room = {
          id: uuid(),
          title,
          gameId: game.id,
          hidden: true,
        };
  
        await data.room.set(game.id, room.id, room);
        data.gameUpdates.publish(game.id, { type: 'rooms' })
  
        return { status: HTTP_STATUS.created, body: { type: 'created', room } };
      }
    },
    PUT: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.query.gameId,
      handler: async ({ game, query: { roomId }, body: { room } }) => {
        const { result: prevRoom } = await data.room.get(game.id, roomId);
        if (!prevRoom)
          return { status: HTTP_STATUS.not_found };
        const nextRoom = {
          ...room,
          id: prevRoom.id,
          gameId: prevRoom.gameId,
        };
        await data.room.set(game.id, room.id, nextRoom);
        data.gameUpdates.publish(game.id, { type: 'rooms' })
  
        return { status: HTTP_STATUS.created, body: { type: 'updated' } };
      }
    },
    DELETE: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.query.gameId,
      async handler({ game, query: { gameId, roomId }}) {
        await data.room.set(game.id, roomId, null);
        data.gameUpdates.publish(game.id, { type: 'rooms' })
        return { status: HTTP_STATUS.created, body: { type: 'deleted' } };
      }
    }
  });
  const allRoomsResourceRoute = createAuthorizedResource(roomAPI['/room/all'], {
    GET: {
      getGameId: r => r.query.gameId,
      scope: { type: 'player-in-game' },
      async handler ({ query: { gameId }, game, identity }) {
        const { result: rooms } = await data.room.query(gameId);
        const isGameMaster = identity.type === 'link' && identity.grant.identity === game.gameMasterId;

        const visibleRooms = isGameMaster ? rooms : rooms.filter(r => !r.hidden);

        return { status: HTTP_STATUS.ok, body: { type: 'found', rooms: visibleRooms } };
      }
    }
  });
  createJSONResourceRoutes(roomAPI['/room/all'], {
    ...defaultOptions,

    GET: async ({ query: { gameId }}) => {
      const { result: rooms } = await data.room.query(gameId);
      return { status: HTTP_STATUS.ok, body: { type: 'found', rooms } };
    }
  });

  const roomAudioRoutes = createJSONResourceRoutes(roomAPI['/room/audio'], {
    ...defaultOptions,

    GET: async ({ query: { gameId, roomId }}) => {
      const { result: audio } = await data.roomAudio.get(gameId, roomId);
      if (!audio)
        return { status: HTTP_STATUS.not_found, body: { type: 'not_found' } }
      return { status: HTTP_STATUS.ok, body: { type: 'found', audio } };
    },
    PUT: async ({ query: { gameId, roomId }, body: { audio }}) => {
      await data.roomAudio.set(gameId, roomId, audio || null);
      data.roomUpdates.publish(roomId, { type: 'audio', audio });
      return { status: HTTP_STATUS.ok, body: { type: 'updated' } };
    }
  });
  const formatMonsterMini = (monsterMini, game, identity) => {
    if (identity.type === 'link' && identity.grant.identity === game.gameMasterId)
      return monsterMini;
    return {
      ...monsterMini,
      maxHitpoints: 100,
      hitpoints: getRoundedMonsterHealthPercentage(monsterMini),
      tempHitpoints: 0,
    };
  };
  const formatEncounter = async (encounter, game, identity) => {
    if (!encounter)
      return;
    const { result: characters } = await data.characters.query(game.id);
    const minis = encounter.minis
      .filter(mini => mini.type !== 'character' || characters.find(c => c.id === mini.characterId))
      .map(mini => mini.type === 'monster' ? formatMonsterMini(mini, game, identity) : mini)
    const turnOrder = encounter.turnOrder
      .filter(turn => minis.find(mini => mini.id === turn.miniId))
      .sort((a, b) => b.initiativeResult - a.initiativeResult)
      .map((a, index) => ({ ...a, index }))
    const turnIndex = (turnOrder.length + encounter.turnIndex) % turnOrder.length || 0;
  
    return {
      ...encounter,
      minis,
      turnOrder,
      turnIndex,
    };
  };
  const roomEncounterRoutes = createAuthorizedResource(roomAPI['/room/encounter'], {
    ...defaultOptions,

    GET: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      handler: async ({ game, query: { roomId }, identity}) => {
        const { result: encounter } = await data.roomEncounter.get(game.id, roomId);
        return { status: HTTP_STATUS.ok, body: { type: 'found', encounter: await formatEncounter(encounter, game, identity) } };
      }
    },
    PUT: {
      scope: { type: 'game-master-in-game' },
      getGameId: r => r.query.gameId,
      handler: async ({ game, query: { roomId }, body: { encounter }, identity }) => {
        await data.roomEncounter.set(game.id, roomId, encounter || null);
        data.roomUpdates.publish(roomId, { type: 'encounter', encounter });
        return { status: HTTP_STATUS.ok, body: { type: 'updated' } };
      }
    }
  });
  const roomEncounterActionsRoutes = createAuthorizedResource(roomAPI['/room/encounter/actions'], {
    ...defaultOptions,

    POST: {
      scope: { type: 'player-in-game' },
      getGameId: r => r.query.gameId,
      handler: async ({ game, query: { roomId }, body: { actions }, identity }) => {
        const { result: state } = await data.roomEncounter.get(game.id, roomId);
        const { result: characters } = await data.characters.query(game.id);
        if (!state)
          return { status: HTTP_STATUS.not_found };
        
        const finalState = actions.reduce((state, action) => reduceEncounterState(state, characters, action), state);
        await data.roomEncounter.set(game.id, roomId, finalState);
        data.roomUpdates.publish(roomId, { type: 'encounter', encounter: finalState });

        return { status: HTTP_STATUS.accepted, body: { type: 'accepted' } };
      }
    }
  });
  

  const roomUpdateResourceRoute = createJSONResourceRoutes({ path: '/room/updates', GET: { toQuery: c.obj({ gameId: m.castGameId, roomId: m.castRoomId }) }}, {
    ...defaultOptions,

    GET: async ({ query: { roomId, gameId } }) => {
      const { result: room } = await data.room.get(gameId, roomId);
      if (!room)
        return { status: HTTP_STATUS.not_found }
      return { status: HTTP_STATUS.switching_protocols };
    }
  });
  const roomUpdateConnectionRoute = createJSONConnectionRoute(roomAPI['/room/updates'], (con, socket) => {
    const { query: { roomId, gameId }, addRecieveListener } = con;
    let identity = { type: 'guest' };
    const onRecieve = async (message) => {
      const grant = await s.auth.sdk.validateProof(message.proof);
      if (!grant)
        return socket.close(4001, `Proof isn't valid`);
      identity = { type: 'link', grant };
    };
    const { removeListener } = addRecieveListener(m => void onRecieve(m));
    
    const onUpdate = async (update) => {
      if (identity.type === 'guest')
        return;
      switch (update.type) {
        case 'encounter':
          const { result: game } = await data.game.get(gameId);
          if (!game)
            return socket.close(4004, `Game does not exist`);
          return con.send({ ...update, encounter: await formatEncounter(update.encounter, game, identity) })
        default:
          return con.send(update);
      }
    };
    const interval = setInterval(() => socket.ping(Date.now()), 1000)
    const { unsubscribe } = data.roomUpdates.subscribe(roomId, onUpdate)
    socket.addEventListener('close', () => {
      removeListener();
      unsubscribe();
      clearInterval(interval);
    });
  });

  const roomStateResources = createStateRoutes(services);
  const roomLobbyRoutes = createLobbyRoutes(services);
  const roomSceneRoutes = createRoomSceneRoutes(services);
  const roomPageRoutes = createRoomPageRoutes(services);

  const http = [
    ...roomResourceRoutes,
    ...roomEncounterRoutes,
    ...roomAudioRoutes,
    ...roomUpdateResourceRoute,
    ...roomStateResources.http,
    ...roomLobbyRoutes.http,
    ...allRoomsResourceRoute,
    ...roomEncounterActionsRoutes,
    ...roomSceneRoutes.http,
    ...roomPageRoutes.http,
  ];
  const ws = [
    roomUpdateConnectionRoute,
    ...roomStateResources.ws,
    ...roomLobbyRoutes.ws,
  ];
  return { http, ws };
};