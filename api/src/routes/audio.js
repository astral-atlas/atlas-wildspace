// @flow strict
/*:: import type { Services } from '../services' */
/*:: import type { APIRoute } from '../routes'; */
/*:: import type { RouteResponse, ResourceRequest, RestOptions, Route } from '@lukekaalim/server'; */
const { withAuthenticationRequests, toActiveTrackEvent } = require("@astral-atlas/wildspace-models");
const { json: { ok }, resource } = require("@lukekaalim/server");
const { withErrorHandling, ws, http, createChannelRoute, createAPIEndpointHandler } = require("./utils");
const { createWSRoute } = require('../socket');
const { activeTrackChannel, getGameAudioEndpoint } = require("@astral-atlas/wildspace-models/api/audio");

/*
/game/tracks/active/events =>
  WS
/game/tracks =>
  GET
*/
const createAudioRoutes = (services/*: Services*/, options/*: RestOptions*/)/*: APIRoute[]*/ => {
  const connectActiveTrack = async ({ query, user, disconnect, send }) => {
    const onReceiveEvent = async (event) => {
      if (user.type !== 'game-master')
        return disconnect(1008, 'Only Game Masters can push audio events');
      await services.audio.setActiveTrack(game, {
        gameId: game.gameId,
        distanceSeconds: event.distanceSeconds,
        trackId: event.trackId,
        fromUnixTime: event.fromUnixTime,
      });
    };
    const onDisconnect = async () => {
      cleanup();
    };
    const onTrackChange = async (newTrack) => {
      send({
        type: 'update',
        distanceSeconds: newTrack.distanceSeconds,
        trackId: newTrack.trackId,
        fromUnixTime: newTrack.fromUnixTime,
      });
    };
    const game = await services.games.read(query.gameId, user);
    const cleanup = services.audio.onActiveTrackChange(game, onTrackChange);
    const onSetupComplete = async () => {
      const track = await services.audio.getActiveTrack(game);
      send({
        type: 'update',
        distanceSeconds: track.distanceSeconds,
        trackId: track.trackId,
        fromUnixTime: track.fromUnixTime,
      });
    };

    return {
      onReceiveEvent,
      onDisconnect,
      onSetupComplete,
    };
  }

  const getAudioInfo = createAPIEndpointHandler(getGameAudioEndpoint, async ({ gameId }, _, { auth }) => {
    const user = await services.auth.getUser(auth);
    const game = await services.games.read(gameId, user);
    return [200, await services.audio.getGameAudio(game)];
  });
  const activeTrackRoute = createChannelRoute(services, activeTrackChannel, connectActiveTrack);
  const audioInfoResource = resource(getGameAudioEndpoint.path, {
    get: withErrorHandling(getAudioInfo),
  }, options);

  return [
    ws(activeTrackRoute),
    ...audioInfoResource.map(http),
  ];
};

module.exports = {
  createAudioRoutes,
};