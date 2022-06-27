// @flow strict
/*:: import type { ServiceProof } from "@astral-atlas/sesame-models"; */
/*:: import type { LinkProof } from "@astral-atlas/sesame-models/src/proof";
import type { User } from "@astral-atlas/sesame-models/src/user";
import type { Cast } from "@lukekaalim/cast"; */

import { castLinkProof, castServiceProof, castUser, castUserId } from "@astral-atlas/sesame-models";
import { castNumber, createObjectCaster, castString, c, castObject } from "@lukekaalim/cast";

/*::
export type DataConfig =
  | {| type: 'file', directory: string |}
  | {| type: 'memory' |}
  | {| type: 'awsS3', bucket: string, keyPrefix: string, region: string |}
  | {| type: 'dynamodb', tableName: string, region: string |}

export type APIAssetURLConfig = {
  type: 'api',
  host: string,
}
export type AWSS3AssetURLConfig = {
  type: 'awsS3',
}
export type AssetURLConfig =
  | APIAssetURLConfig
  | AWSS3AssetURLConfig

export type AWSS3AssetConfig = {
  type: 'awsS3',
  bucket: string,
  keyPrefix: string,
  region: string,
  url: ?AssetURLConfig,
};
export type LocalAssetConfig = {
  type: 'local',
  url: ?APIAssetURLConfig,
};


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
  type?: ?'final',
  port: number,
  data: DataConfig,
  asset: AssetConfig,
  auth: AuthConfig,
};

export type AWSParameterStoreConfig = {
  type: 'aws-parameter-store',
  name: string,
  region: string,
}

export type APIConfigChain =
  | APIConfig
  | AWSParameterStoreConfig
*/

export const castDataConfig/*: Cast<DataConfig>*/ = c.or('type', {
  'file': c.obj({ type: c.lit('file'), directory: c.str }),
  'awsS3': c.obj({ type: c.lit('awsS3'), bucket: c.str, keyPrefix: c.str, region: c.str }),
  'memory': c.obj({ type: c.lit('memory') }),
  'dynamodb': c.obj({ type: c.lit('dynamodb'), tableName: c.str, region: c.str }),
})
export const castAPIAssetURLConfig/*: Cast<APIAssetURLConfig>*/ = c.obj({
  type: c.lit('api'),
  host: c.str,
})
export const castAWSS3AssetURLConfig/*: Cast<AWSS3AssetURLConfig>*/ = c.obj({
  type: c.lit('awsS3'),
})
export const castAssetURLConfig/*: Cast<AssetURLConfig>*/ = c.or('type', {
  'api': castAPIAssetURLConfig,
  'awsS3': castAWSS3AssetURLConfig,
});


export const castAWSS3AssetConfig/*: Cast<AWSS3AssetConfig>*/ = c.obj({
  type: c.lit('awsS3'),
  bucket: c.str,
  keyPrefix: c.str,
  region: c.str,
  url: c.maybe(castAssetURLConfig),
});
export const castLocalAssetConfig/*: Cast<LocalAssetConfig>*/ = c.obj({
  type: c.lit('local'),
  url: c.maybe(castAPIAssetURLConfig),
});

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
  type: c.maybe(c.lit('final')),
  port: castNumber,
  data: castDataConfig,
  asset: castAssetConfig,
  auth: castAuthConfig,
});
const castParameterStoreConfig = c.obj({
  type: c.lit('aws-parameter-store'),
  name: c.str,
  region: c.str,
})

export const castAPIConfigChain/*: Cast<APIConfigChain>*/ = (value) => {
  const obj = castObject(value);
  switch (obj.type) {
    case 'final':
    default:
      return castAPIConfig(obj);
    case 'aws-parameter-store':
      return castParameterStoreConfig(obj);
  }
}
/*::
export type WWWConfig = {
  identity?: ?(
    | { type: 'store' }
    | { type: 'fake', proof: LinkProof }
  ),
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
  identity: c.maybe(c.or('type', {
    'store': c.obj({ type: (c.lit('store')/*: Cast<'store'>*/) }),
    'fake': c.obj({ type: (c.lit('fake')/*: Cast<'fake'>*/), proof: castLinkProof }),
  })),
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
