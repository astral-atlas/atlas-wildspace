// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */
/*:: import type { Services } from "./services.js"; */

import { createJSONResourceRoutes, createResourceRoutes } from '@lukekaalim/http-server';
import { HTTP_STATUS } from "@lukekaalim/net-description";

import { createAudioRoutes } from './routes/audio.js';
import { createAssetRoutes } from './routes/asset.js';
import { createRoomRoutes } from './routes/room.js';
import { createGameRoutes } from './routes/game.js';
import { selfAPI } from '@astral-atlas/wildspace-models';
import { defaultOptions } from './routes/meta.js';
import { createHomeRoutes } from "./routes/home.js";

/*::
export type RoutesConstructor = (services: Services) => { ws: WebSocketRoute[], http: HTTPRoute[] };
*/

export const createRoutes = (services/*: Services*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {
  const audioRoutes = createAudioRoutes(services);
  const assetRoutes = createAssetRoutes(services);
  const roomRoutes = createRoomRoutes(services);
  const gameRoutes = createGameRoutes(services);

  const selfRoutes = createJSONResourceRoutes(selfAPI['/self'], {
    ...defaultOptions,
    GET: async ({ headers: { authorization }}) => {
      const identity = await services.auth.getAuthFromHeader(authorization);
      if (identity.type !== 'link')
        throw new Error();

      const { name } = await services.auth.sdk.getUser(identity.grant.identity);

      return { status: HTTP_STATUS.ok, body: { type: 'found', name } };
    }
  })
  const homeRoutes = createHomeRoutes(services);

  const ws = [
    ...audioRoutes.ws,
    ...assetRoutes.ws,
    ...roomRoutes.ws,
    ...gameRoutes.ws,
  ];
  const http = [
    ...assetRoutes.http,
    ...audioRoutes.http,
    ...roomRoutes.http,
    ...gameRoutes.http,
    ...selfRoutes,
    ...homeRoutes.http,
  ];
  return { ws, http }
};