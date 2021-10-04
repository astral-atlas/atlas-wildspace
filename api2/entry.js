// @flow strict
import { createServer } from 'http';
import { WebSocketServer } from 'ws';

import { createWebSocketListener, createJSONConnectionRoute } from "@lukekaalim/ws-server";
import { createRouteListener, createJSONResourceRoutes, createFixedListener, listenServer } from "@lukekaalim/http-server";
import { HTTP_STATUS } from "@lukekaalim/net-description";


import { audioAPI } from '@astral-atlas/wildspace-models';
import { createMemoryData, createFileData } from "@astral-atlas/wildspace-data";

import { createRoutes } from './routes.js';

const createWildspaceServer = () => {
  const middleware = (r) => {
    const handler = async (request) => {
      try {
        console.log(request.method, request.path, Object.fromEntries(request.query.entries()), request.headers);
        const response = await r.handler(request);
        console.log(request.method, request.path, response.status, response.headers);
        return response;
      } catch (error) {
        console.error(error);
        throw error;
      }
    };
    return {
      ...r,
      handler,
    }
  }

  let playlist = {
    id: '0',
    gameId: '0',
    title: 'cool-list!',
    trackIds: ['a', 'b'],
  };
  let playlistState = {
    playlistId: '0',
    trackId: 'a',
    // the Unix Time when the first track would have started
    playlistStartTime: Date.now(),
    playState: 'playing',
    globalVolume: 1,
  }

  let playlistListeners = new Set();

  const playlistStateConnectionRoute = createJSONConnectionRoute(audioAPI['/playlist/state'].connection, (connection) => {
    const onPlaylistUpdate = () => {
      connection.send({ state: playlistState, type: 'update' });
    }
    playlistListeners.add(onPlaylistUpdate);
    connection.send({ state: playlistState, type: 'update' });
  });
  const playlistStateResourceRoutes = createJSONResourceRoutes(audioAPI['/playlist/state'].resource, {
    access: { origins: { type: 'wildcard' }, methods: ['GET', 'PUT'], headers: ['content-type'] },

    GET: () => {
      return { status: HTTP_STATUS.switching_protocols }
    },
    PUT: ({ query: { audioPlaylistId, gameId }, body: { state: newPlaylistState } }) => {
      playlistState = newPlaylistState;
      for (const listener of playlistListeners)
        listener();
      
      return { status: HTTP_STATUS.ok, body: { type: 'updated' } };
    }
  })
  const playlistResourceRoutes = createJSONResourceRoutes(audioAPI['/playlist'], {
    access: { origins: { type: 'wildcard' }, methods: ['GET'], headers: ['content-type'] },

    GET: ({ query: { gameId, audioPlaylistId } }) => {
      return { status: HTTP_STATUS.ok, body: { type: 'found', playlist } };
    }
  });
  console.log(process.cwd())
  const { ws, http } = createRoutes(createFileData('./data')); 
  const httpRoutes = [
    ...playlistStateResourceRoutes,
    ...playlistResourceRoutes,
    ...http,
  ].map(middleware);
  const wsRoutes = [
    playlistStateConnectionRoute,
    ...ws,
  ];

  const httpServer = createServer();
  const wsServer = new WebSocketServer({ server: httpServer });

  httpServer.addListener('request', createRouteListener(httpRoutes, createFixedListener({ status: 404, body: `Page not found`, headers: {} })));
  wsServer.addListener('connection', createWebSocketListener(wsRoutes));

  return [httpServer, wsServer]
};

const main = async () => {
  const [httpServer, wsServer] = createWildspaceServer();
  const { httpOrigin, wsOrigin } = await listenServer(httpServer, 5567, 'localhost');
  console.log(`Listening on ${httpOrigin} & ${wsOrigin}`)
};

main();