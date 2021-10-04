// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */

import { createAudioRoutes } from './routes/audio.js';
import { createAssetRoutes } from './routes/asset.js';

export const createRoutes = (data/*: WildspaceData*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {
  const audioRoutes = createAudioRoutes(data);
  const assetRoutes = createAssetRoutes(data);

  const ws = [
    ...audioRoutes.ws,
    ...assetRoutes.ws,
  ];
  const http = [
    ...assetRoutes.http,
    ...audioRoutes.http,
  ];
  return { ws, http }
};