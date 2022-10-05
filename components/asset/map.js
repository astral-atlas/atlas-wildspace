// @flow strict

/*::
import type { AssetID, AssetInfo } from "@astral-atlas/wildspace-models";

export type AssetDownloadURLMap = Map<AssetID, ?AssetInfo>;
*/

export const createAssetDownloadURLMap = (
  assets/*: $ReadOnlyArray<AssetInfo>*/
)/*: AssetDownloadURLMap*/ => {
  return new Map(assets.map(a => [a.description.id, a]))
}