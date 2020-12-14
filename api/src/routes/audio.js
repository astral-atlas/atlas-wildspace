// @flow strict
/*:: import type { Services } from '../services' */
/*:: import type { APIRoute } from '../routes'; */
/*:: import type { RouteResponse, ResourceRequest, RestOptions, Route } from '@lukekaalim/server'; */
const { withAuthenticationRequests, toActiveTrackEvent } = require("@astral-atlas/wildspace-models");
const { json: { ok }, resource } = require("@lukekaalim/server");
const { withErrorHandling, ws, http } = require("./utils");
const { createWSRoute } = require('../socket');

/*
/game/tracks/active/events =>
  WS
/game/tracks =>
  GET
*/
const createAudioRoutes = (services/*: Services*/, options/*: RestOptions*/)/*: APIRoute[]*/ => {
  const connectActiveTrack = async ({ socket, query: { gameId } }) => {
    let user;
    let game;
    let cleanup;
  
    const onUpdate = (trackState) => {
      socket.send(JSON.stringify(trackState));
    };
    const authenticateUser = async (event) => {
      cleanup && cleanup();
      user = await services.auth.getUserFromRequest(event);
      game = await services.games.read(gameId, user);
      cleanup = services.audio.onActiveTrackChange(game, onUpdate);
      socket.send(JSON.stringify({ type: 'grant-authentication', user }));
      socket.send(JSON.stringify(await services.audio.activeTrack.get(game)));
    };
    const update = async (event) => {
      if (user.type !== 'game-master')
        return socket.close(1008, 'Only Game Masters can push audio events');
      await services.audio.activeTrack.set(game, event);
    };
    socket.on('message', async (data) => {
      try {
        const event = withAuthenticationRequests(JSON.parse(data), toActiveTrackEvent);
        switch (event.type) {
          case 'request-authentication':
            return await authenticateUser(event);
          case 'update':
            return await update(event);
        }
      } catch(error) {
        console.error(error);
      }
    });
  }


  const getAudioInfo = async ({ query: { gameId }, auth }) => {
    const user = await services.auth.getUser(auth);
    const game = await services.games.read(gameId, user);
    return ok(await services.audio.getAudioInfo(game));
  };

  const activeTrackEvents = createWSRoute('/game/tracks/active/events', connectActiveTrack);
  const audioInfoResource = resource('/game/tracks', {
    get: withErrorHandling(getAudioInfo),
  }, options);

  return [
    ws(activeTrackEvents),
    ...audioInfoResource.map(http),
  ];
};

module.exports = {
  createAudioRoutes,
};