// @flow strict

/*:: import type { HTTPClient } from '@lukekaalim/http-client'; */
/*:: import type { AssetID, AssetDescription } from "@astral-atlas/wildspace-models"; */
/*:: import type { HTTPServiceClient, WSServiceClient } from './wildspace.js'; */
import { assetAPI } from '@astral-atlas/wildspace-models';
import { createJSONResourceClient } from '@lukekaalim/http-client';
import * as upload from "../components/audio/upload";

/*::
export type AssetClient = {
  create: (name: string, MIMEType: string, content: Uint8Array) => Promise<{ description: AssetDescription, downloadURL: URL }>,
  //load: (id: AssetID) => Promise<Uint8Array>,
  peek: (assetId: AssetID) => Promise<{ description: AssetDescription, downloadURL: URL }>
};
*/

export const createAssetClient = (http/*: HTTPServiceClient*/, unauthorizedClient/*: HTTPClient*/)/*: AssetClient*/ => {
  const assetResource = http.createResource(assetAPI["/asset"]);

  const create = async (name, MIMEType, content) => {
    const bytes = content.byteLength;
    const { body: { description, uploadURL, downloadURL } } = await assetResource.POST({ body: { name, MIMEType, bytes }});

    const headers = { 'Content-Type': MIMEType, 'Content-Length': bytes.toString() };
    
    await unauthorizedClient.sendRequest({ url: uploadURL, headers, method: 'PUT', body: content });

    return { description, downloadURL: new URL(downloadURL) };
  };
  const peek = async (assetId) => {
    const { body } = await assetResource.GET({ query: { assetId } });
    if (body.type !== 'found')
      throw new Error();

    const { description, downloadURL } = body;

    return { description, downloadURL: new URL(downloadURL)  };
  };

  return {
    create,
    //load,
    peek,
  };
};
