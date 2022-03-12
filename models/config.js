// @flow strict
/*:: import type { ServiceProof } from "@astral-atlas/sesame-models"; */
/*:: import type { Cast } from "@lukekaalim/cast"; */

import { castServiceProof } from "@astral-atlas/sesame-models";
import { castNumber, createObjectCaster, castString, c } from "@lukekaalim/cast";

/*::
export type DataConfig =
  | {| type: 'file', directory: string |}
  | {| type: 'memory' |}
  | {| type: 'awsS3', bucket: string, keyPrefix: string, region: string |}

export type FileAssetConfig = { type: 'file', directory: string };
export type AWSS3AssetConfig = { type: 'awsS3', bucket: string, keyPrefix: string, region: string };
export type MemoryAssetConfig = { type: 'memory' };
export type AssetConfig = 
  | FileAssetConfig
  | AWSS3AssetConfig
  | MemoryAssetConfig

export type APIConfig = {
  port: number,
  data: DataConfig,
  asset: AssetConfig,
  api: {
    sesame: {
      origin: string,
      proof: ServiceProof,
    }
  }
};
*/

export const castDataConfig/*: Cast<DataConfig>*/ = c.or('type', {
  'file': c.obj({ type: c.lit('file'), directory: c.str }),
  'awsS3': c.obj({ type: c.lit('awsS3'), bucket: c.str, keyPrefix: c.str, region: c.str }),
  'memory': c.obj({ type: c.lit('memory') }),
})
export const castFileAssetConfig/*: Cast<FileAssetConfig>*/ = c.obj({ type: c.lit('file'), directory: c.str, });
export const castAWSS3AssetConfig/*: Cast<AWSS3AssetConfig>*/ = c.obj({ type: c.lit('awsS3'), bucket: c.str, keyPrefix: c.str, region: c.str });
export const castMemoryAssetConfig/*: Cast<MemoryAssetConfig>*/ = c.obj({ type: c.lit('memory') });

export const castAssetConfig/*: Cast<AssetConfig>*/ = c.or('type', {
  'file': castFileAssetConfig,
  'awsS3': castAWSS3AssetConfig,
  'memory': castMemoryAssetConfig,
});

export const castAPIConfig/*: Cast<APIConfig>*/ = createObjectCaster({
  port: castNumber,
  data: castDataConfig,
  asset: castAssetConfig,
  api: c.obj({
    sesame: c.obj({
      origin: c.str,
      proof: castServiceProof
    })
  })
});

/*::
export type WWWConfig = {
  www: {
    sesame: {
      httpOrigin: string,
    }
  },
  api: {
    sesame: {
      httpOrigin: string,
    },
    wildspace: {
      httpOrigin: string,
      wsOrigin: string,
    },
  },
};
*/

export const castWWWConfig/*: Cast<WWWConfig>*/ = c.obj({
  www: c.obj({
    sesame: c.obj({
      httpOrigin: c.str
    }),
  }),
  api: c.obj({
    wildspace: c.obj({
      httpOrigin: c.str,
      wsOrigin: c.str,
    }),
    sesame: c.obj({
      httpOrigin: c.str,
    })
  }),
});
