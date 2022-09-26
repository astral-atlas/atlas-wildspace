// @flow strict
import { v4 } from "uuid";
/*::
import type { AssetID, AssetInfo } from "@astral-atlas/wildspace-models";
import type { AssetClient } from "@astral-atlas/wildspace-client2";
import type { AssetDownloadURLMap } from "@astral-atlas/wildspace-components";
*/

export const createWebAssetMock = (
  initialMap/*: ?AssetDownloadURLMap*/ = null,
  onAddAsset/*: AssetInfo => mixed*/ = _ => {}
)/*: AssetClient*/ => {
  const map = initialMap || new Map();
  
  const create = async (name, type, buffer) => {
    const description = {
      name,
      id: v4(),
      bytes: buffer.byteLength,
      MIMEType: type,
      uploaded: Date.now(),
      creator: 'me'
    }
    const downloadURL = URL.createObjectURL(new Blob([buffer]))
    const info = { downloadURL, description };
    onAddAsset(info)
    map.set(description.id, info);
    return { description, downloadURL: new URL(downloadURL) };
  };
  const peek = async (id) => {
    const info = map.get(id);
    if (!info)
      throw new Error();
    return { description: info.description, downloadURL: new URL(info.downloadURL) };
  };
  return { create, peek }
}