// @flow strict
/*:: import type { ServiceProof } from "@astral-atlas/sesame-models"; */
/*:: import type { User } from "@astral-atlas/sesame-models/src/user";
import type { Cast } from "@lukekaalim/cast"; */

import { castServiceProof, castUser } from "@astral-atlas/sesame-models";
import { castNumber, createObjectCaster, castString, c } from "@lukekaalim/cast";

/*::
export type DataConfig =
  | {| type: 'file', directory: string |}
  | {| type: 'memory' |}
  | {| type: 'awsS3', bucket: string, keyPrefix: string, region: string |}

export type AWSS3AssetConfig = { type: 'awsS3', bucket: string, keyPrefix: string, region: string };
export type LocalAssetConfig = { type: 'local' };
export type AssetConfig = 
  | AWSS3AssetConfig
  | LocalAssetConfig

export type SesameAPIAuthConfig = {|
  type: 'sesame',
  origin: string,
  proof: ServiceProof,
|};
export type FakeAuthConfig = {|
  type: 'fake',
  user: User,
|};
export type AuthConfig =
  | SesameAPIAuthConfig
  | FakeAuthConfig

export type APIConfig = {
  port: number,
  data: DataConfig,
  asset: AssetConfig,
  auth: AuthConfig,
};
*/

export const castDataConfig/*: Cast<DataConfig>*/ = c.or('type', {
  'file': c.obj({ type: c.lit('file'), directory: c.str }),
  'awsS3': c.obj({ type: c.lit('awsS3'), bucket: c.str, keyPrefix: c.str, region: c.str }),
  'memory': c.obj({ type: c.lit('memory') }),
})
export const castAWSS3AssetConfig/*: Cast<AWSS3AssetConfig>*/ = c.obj({ type: c.lit('awsS3'), bucket: c.str, keyPrefix: c.str, region: c.str });
export const castLocalAssetConfig/*: Cast<LocalAssetConfig>*/ = c.obj({ type: c.lit('local') });

export const castAssetConfig/*: Cast<AssetConfig>*/ = c.or('type', {
  'awsS3': castAWSS3AssetConfig,
  'local': castLocalAssetConfig,
});

export const castFakeAuthConfig/*: Cast<FakeAuthConfig>*/ = c.obj({
  type: c.lit('fake'),
  user: castUser,
});
export const castSesameAPIAuthConfig/*: Cast<SesameAPIAuthConfig>*/ = c.obj({
  type: c.lit('sesame'),
  origin: c.str,
  proof: castServiceProof,
});
export const castAuthConfig/*: Cast<AuthConfig>*/ = c.or('type', {
  fake: castFakeAuthConfig,
  sesame: castSesameAPIAuthConfig,
});

export const castAPIConfig/*: Cast<APIConfig>*/ = createObjectCaster({
  port: castNumber,
  data: castDataConfig,
  asset: castAssetConfig,
  auth: castAuthConfig,
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
