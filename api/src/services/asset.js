// @flow strict
/*:: export type * from './asset/assetBuffer'; */
/*:: export type * from './asset/assetDatabase'; */
/*:: export type * from './asset/assetURL'; */

const { createLocalAssetBufferService } = require("./asset/assetBuffer");
const { createAssetDatabaseService } = require("./asset/assetDatabase");
const { createLocalAssetURLService } = require("./asset/assetURL");

/*:: import type { Tables } from '../tables'; */

/*:: import type { AssetBufferService } from './asset/assetBuffer'; */
/*:: import type { AssetDatabaseService } from './asset/assetDatabase'; */
/*:: import type { AssetURLService } from './asset/assetURL'; */

/*::
export type AssetServices = {
  buffer: AssetBufferService,
  database: AssetDatabaseService,
  url: AssetURLService,
};
*/

const createAssetServices = (tables/*: Tables*/)/*: AssetServices*/ => {
  const buffer = createLocalAssetBufferService(tables, './buffers');
  const url = createLocalAssetURLService(tables);
  const database = createAssetDatabaseService(tables, url);
  
  return {
    buffer,
    database,
    url,
  }
};

module.exports = { 
  createAssetServices,
};