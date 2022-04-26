// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { UserID } from '@astral-atlas/sesame-models'; */
import { createObjectCaster, castString, createArrayCaster, castNumber } from '@lukekaalim/cast';
import { castUserId } from '@astral-atlas/sesame-models';

// An "asset" is a binary blob with metadata
/*::
export type AssetID = string;
export type AssetDescription = {
  id: AssetID,
  name: string,
  uploaded: number,
  MIMEType: string,
  bytes: number,

  creator: UserID,
};

export type AssetGroupID = string;
export type AssetGroup = {
  id: AssetGroupID,

  assetIds: $ReadOnlyArray<AssetID>,
  name: string,
};
*/

export const castAssetID/*: Cast<AssetID>*/ = castString;
export const castAssetDescription/*: Cast<AssetDescription>*/ = createObjectCaster({
  id: castAssetID,
  name: castString,
  uploaded: castNumber,
  MIMEType: castString,
  bytes: castNumber,
  creator: castUserId,
});

export const castAssetGroupId/*: Cast<AssetGroupID>*/ = castString;
export const castAssetGroup/*: Cast<AssetGroup>*/ = createObjectCaster({
  id: castAssetGroupId,

  assetIds: createArrayCaster(castAssetID),
  name: castString,
});

/*::
export type AssetInfo = {
  downloadURL: string,
  description: AssetDescription
}

export type AssetInfoDatabase = $ReadOnlyArray<[AssetID, ?AssetInfo]>
*/