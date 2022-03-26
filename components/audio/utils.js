// @flow strict

/*::
import type { AudioTrack } from "@astral-atlas/wildspace-models";
import type { LocalAsset } from "..";
*/

export const getTrackCoverImageAssetURL = (
  track/*: AudioTrack*/,
  assets/*: LocalAsset[]*/
)/*: ?URL*/ => {
  const id = track.coverImageAssetId;
  if (!id)
    return;
  const asset = assets.find(asset => asset.id === id);
  if (!asset)
    return;
  return asset.url;
}