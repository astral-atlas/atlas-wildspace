// @flow strict
/*:: import type { APIConfig } from '@astral-atlas/wildspace-models'; */
/*:: import type { SesameSDK } from '@astral-atlas/sesame-client'; */
/*:: import type { WildspaceData } from '@astral-atlas/wildspace-data'; */
/*:: import type { AuthService } from './services/auth.js'; */
/*:: import type { GameService } from './services/game.js'; */
/*:: import type { AssetService } from './services/asset.js'; */
/*::
import type { RoomService } from "./services/room";
import type { UpdateService } from "./services/update";
import type { PageService } from "./services/page";
*/

import { createData } from "@astral-atlas/wildspace-data";
import { createAuthService } from './services/auth.js';
import { createGameService } from './services/game.js';
import { createRoomService } from './services/room.js';
import { createAssetService } from './services/asset.js';
import { createUpdateService } from "./services/update.js";
import { createPageService } from "./services/page.js";

/*::
export type Services = {
  data: WildspaceData,
  auth: AuthService,
  game: GameService,
  room: RoomService,
  update: UpdateService,
  asset: AssetService,
  config: APIConfig,
  page: PageService,
};
*/

export const createServices = (config/*: APIConfig*/)/*: Services*/ => {
  const auth = createAuthService(config);
  const data = createData(config);
  const asset = createAssetService(data, config);
  const game = createGameService(data, auth, asset);
  const room = createRoomService(data, asset, game);
  const page = createPageService(data, game, room, asset);
  const update = createUpdateService(data, page, room, game, asset);

  return {
    auth,
    data,
    game,
    room,
    asset,
    config,
    update,
    page,
  };
};