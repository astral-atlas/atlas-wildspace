// @flow strict

/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { AssetID, AssetDescription } from "@astral-atlas/wildspace-models"; */
import { assetAPI } from '@astral-atlas/wildspace-models';
import { createJSONResourceClient } from '@lukekaalim/http-client';

/*::
export type AssetClient = {
  create: (name: string, MIMEType: string, content: Uint8Array) => Promise<{ description: AssetDescription, downloadURL: URL }>,
  //load: (id: AssetID) => Promise<Uint8Array>,
  peek: (assetId: AssetID) => Promise<{ description: AssetDescription, downloadURL: URL }>
};
*/

export const createAssetClient = (httpClient/*: HTTPClient*/, httpOrigin/*: string*/, wsOrigin/*: string*/)/*: AssetClient*/ => {
  const assetResource = createJSONResourceClient(assetAPI["/asset"], httpClient, httpOrigin);

  const create = async (name, MIMEType, content) => {
    const bytes = content.byteLength;
    const { body: { description, uploadURL, downloadURL } } = await assetResource.POST({ body: { name, MIMEType, bytes }});
    await httpClient.sendRequest({ url: uploadURL, headers: {}, method: 'PUT', body: content });
    return { description, downloadURL: new URL(downloadURL) };
  };
  const peek = async (assetId) => {
    const { body: { description, downloadURL } } = await assetResource.GET({ query: { assetId } });

    return { description, downloadURL: new URL(downloadURL)  };
  };

  return {
    create,
    //load,
    peek,
  };
};
