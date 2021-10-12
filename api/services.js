// @flow strict
/*:: import type { APIConfig } from '@astral-atlas/wildspace-models'; */
/*:: import type { SesameSDK } from '@astral-atlas/sesame-client'; */
/*:: import type { WildspaceData } from '@astral-atlas/wildspace-data'; */
/*:: import type { AuthService } from './services/auth.js'; */
/*:: import type { GameService } from './services/game.js'; */

import { createMemoryData, createFileData, createAWSS3Data } from "@astral-atlas/wildspace-data";
import { S3 } from "@aws-sdk/client-s3";
import { createAuthService } from './services/auth.js';
import { createGameService } from './services/game.js';

/*::
export type Services = {
  data: WildspaceData,
  auth: AuthService,
  game: GameService,
};
*/

const createData = (config) => {
  const dataConfig = config.data;
  switch (dataConfig.type) {
    case 'memory':
      return createMemoryData();
    case 'file':
      return createFileData(dataConfig.directory);
    case 'awsS3':
      const s3 = new S3({ region: dataConfig.region })
      return createAWSS3Data(s3, dataConfig.bucket, dataConfig.keyPrefix);
  }
}

export const createServices = (config/*: APIConfig*/)/*: Services*/ => {
  const auth = createAuthService(config);
  const { data } = createData(config);
  const game = createGameService(data, auth);

  return {
    auth,
    data,
    game,
  };
};