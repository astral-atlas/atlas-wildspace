// @flow strict
/*:: import type { Route as HTTPRoute } from "@lukekaalim/http-server"; */
/*:: import type { WebSocketRoute } from "@lukekaalim/ws-server"; */
/*:: import type { WildspaceData } from "@astral-atlas/wildspace-data"; */

import { v4 as uuid } from 'uuid';
import { Readable } from "stream";

import { createJSONResourceRoutes, createResourceRoutes, readBufferBody, getRequestRange, getRangeResponseHead, readStreamBytes } from "@lukekaalim/http-server";
import { assetAPI } from '@astral-atlas/wildspace-models';
import { HTTP_STATUS } from "@lukekaalim/net-description";

import { createAudioRoutes } from './routes/audio.js';

export const createRoutes = (data/*: WildspaceData*/)/*: { ws: WebSocketRoute[], http: HTTPRoute[] }*/ => {
  const options = {
    access: { origins: { type: 'wildcard' }, methods: ['GET', 'PUT', 'POST'], headers: ['content-type'] },
  };

  const assetResourceRoutes = createJSONResourceRoutes(assetAPI['/asset'], {
    ...options,
    GET: async ({ query: { assetId } }) => {
      const { result: description } = await data.assets.get(assetId);
      if (!description)
        return { status: HTTP_STATUS.not_found };
      const downloadURL = `http://127.0.0.1:5567/assets/data?assetId=${assetId}`
      return { status: HTTP_STATUS.ok, body: { type: 'found', description, downloadURL } };
    },
    POST: async ({ body: { MIMEType, bytes, name } }) => {
      const description = {
        id: uuid(),
        name,
        bytes,
        MIMEType,
        creator: '',
        uploaded: Date.now(),
      };
      const url = `http://127.0.0.1:5567/assets/data?assetId=${description.id}`;
      const uploadURL = url;
      const downloadURL = url;
      await data.assets.set(description.id, description);
      return { status: HTTP_STATUS.created, body: { type: 'created', uploadURL, downloadURL, description }};
    }
  });
  const assetDataResoureRoutes = createResourceRoutes({
    path: '/assets/data',
    ...options,

    methods: {
      GET: async ({ query, headers }) => {
        const assetId = query.get('assetId');
        const range = getRequestRange(headers);
        if (!assetId)
          return { status: HTTP_STATUS.not_found, body: null, headers: {} };
        const { result } = await data.assetData.get(assetId);
        const { result: description } = await data.assets.get(assetId); 
        if (!result || !description)
          return { status: HTTP_STATUS.not_found, body: null, headers: {} };

        const contentHeaders = {
          'content-type': description.MIMEType,
          'content-length': description.bytes.toString(),
        };
        const { status: rangeStatus, headers: rangeHeaders, slice } = getRangeResponseHead(range, description.bytes);

        const responseHeaders = {
          ...rangeHeaders,
          ...contentHeaders,
        }
        const responseBody = slice ?
          (await readStreamBytes(result(), description.bytes)).slice(slice.start, slice.end) :
          result();
        
        return { status: rangeStatus || HTTP_STATUS.ok, headers: responseHeaders, body: responseBody };
      },
      PUT: async ({ query, incoming, headers }) => {
        const assetId = query.get('assetId');
        if (!assetId)
          return { status: HTTP_STATUS.not_found, body: null, headers: {} };
        
        const buffer = await readBufferBody(incoming, headers);
        await data.assetData.set(assetId, () => Readable.from([buffer]))
        return { status: HTTP_STATUS.ok, headers: {}, body: null };
      }
    }
  })

  const audioRoutes = createAudioRoutes(data);

  const ws = [
    ...audioRoutes.ws
  ];
  const http = [
    ...assetResourceRoutes,
    ...assetDataResoureRoutes,
    ...audioRoutes.http,
  ];
  return { ws, http }
};