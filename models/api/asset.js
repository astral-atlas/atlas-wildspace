// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { IdentityProof } from '@astral-atlas/sesame-models'; */
/*:: import type { Connection, Resource, ResourceDescription, ConnectionDescription } from '@lukekaalim/net-description'; */
/*:: import type { AssetID, AssetDescription, AssetGroupID, AssetGroup } from "../asset.js"; */

import { createObjectCaster, createConstantCaster, createConstantUnionCaster, castString, castNumber } from "@lukekaalim/cast";
import { castIdentityProof } from "@astral-atlas/sesame-models";
import { castAssetID, castAssetDescription } from "../asset.js";

/*::
export type AssetResource = {|
  GET: {
    query: { assetId: AssetID },
    request: empty,
    response: 
      | { type: 'found', downloadURL: string, description: AssetDescription }
      | { type: 'not_found' }
  },
  POST: {
    query: empty,
    request: { name: string, MIMEType: string, bytes: number },
    response: { type: 'created', uploadURL: string, downloadURL: string, description: AssetDescription }
  }
|}

export type AssetDataResource = {|
  GET: {
    query: { assetId: AssetID },
    request: empty,
    response: Uint8Array
  },
  PUT: {
    query: { assetId: AssetID },
    request: Uint8Array,
    response: { type: 'uploaded' }
  }
|}

export type AssetGroupResource = {|
  GET: {
    query: { assetGroupId: AssetGroupID },
    request: empty,
    response: { type: 'found', assetGroup: AssetGroup }
  },
  POST: {
    query: empty,
    request: { name: string, assetIds: $ReadOnlyArray<AssetID> },
    response: { type: 'created', assetGroup: AssetGroup }
  },
  PUT: {
    query: { assetGroupId: AssetGroupID },
    request: { name: ?string, assetIds: ?$ReadOnlyArray<AssetID> },
    response: { type: 'updated', assetGroup: AssetGroup }
  }
|}

export type AssetAPI = {
  '/asset': AssetResource,
  '/asset/data': AssetDataResource,
  '/asset/groups': AssetGroupResource,
};
*/

export const assetResourceDescription/*: ResourceDescription<AssetResource>*/ = {
  path: '/asset',

  GET: {
    toQuery: createObjectCaster({ assetId: castAssetID }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('found'), downloadURL: castString, description: castAssetDescription }) 
  },
  POST: {
    toRequestBody: createObjectCaster({ name: castString, MIMEType: castString, bytes: castNumber }),
    toResponseBody: createObjectCaster({ type: createConstantCaster('created'), uploadURL: castString, downloadURL: castString, description: castAssetDescription }) 
  }
};

export const assetAPI = {
  '/asset': assetResourceDescription,
};
