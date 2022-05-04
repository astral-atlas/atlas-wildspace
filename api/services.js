// @flow strict
/*:: import type { APIConfig } from '@astral-atlas/wildspace-models'; */
/*:: import type { SesameSDK } from '@astral-atlas/sesame-client'; */
/*:: import type { WildspaceData } from '@astral-atlas/wildspace-data'; */
/*:: import type { AuthService } from './services/auth.js'; */
/*:: import type { GameService } from './services/game.js'; */
/*:: import type { AssetService } from './services/asset.js'; */

import { createData } from "@astral-atlas/wildspace-data";
import { createAuthService } from './services/auth.js';
import { createGameService } from './services/game.js';
import { createAssetService } from './services/asset.js';

/*::
export type Services = {
  data: WildspaceData,
  auth: AuthService,
  game: GameService,
  asset: AssetService,
  config: APIConfig
};
*/

export const createServices = (config/*: APIConfig*/)/*: Services*/ => {
  const auth = createAuthService(config);
  const { data } = createData(config);
  const game = createGameService(data, auth);
  const asset = createAssetService(data, config);

  return {
    auth,
    data,
    game,
    asset,
    config,
  };
};