// @flow strict
/*:: import type { Services } from '../services' */
/*:: import type { RouteResponse, ResourceRequest, RestOptions, Route } from '@lukekaalim/server'; */
const { Readable } = require('stream');
const { readFile } = require('fs').promises;
const {
  json: { ok: jsonOk, created: jsonCreated },
  resource,
  stream: { ok: streamOk, created: streamCreated },
  createStreamResponse,
} = require("@lukekaalim/server");
const { postAudioAssetEndpoint, getAudioAssetEndpoint } = require('@astral-atlas/wildspace-models');
const { MissingParameterError, BadRequestBodyError } = require("../errors");
const { withErrorHandling, streamToBuffer, createAPIEndpointHandler } = require("./utils");
const { get, createServer } = require('http');

/*::
type ContentRange = {
  unit: 'bytes',
  start: number,
  end: number,
  size: number,
};
*/

const getStartAndEnd = (startAndEndString, buffer)/*: [number, number]*/ => {
  if (startAndEndString === '*')
    return [0, buffer.length];
  return startAndEndString.split('-', 2);
};

const getRangeRequests = (headers, buffer) => {
  const bufferEndIndex = buffer.byteLength;
  const rangeHeader = headers['range'];
  if (!rangeHeader)
    return null
  const [rangeUnit, rangeDirectives] = rangeHeader.split('=', 2);
  if (rangeUnit !== 'bytes')
    throw new Error("Whoops I dont understand this");
  const rangeBlocks = rangeDirectives.split(', ');
  return rangeBlocks.map(rangeBlock => {
    const [start, end] = rangeBlock.split('-', 2);
    if (!end)
      return { start: parseInt(start, 10), end: bufferEndIndex };
    if (!start)
      return { start: buffer.byteLength - parseInt(end, 10), end: bufferEndIndex };
    return { start: parseInt(start, 10), end: parseInt(end, 10) }
  })
};

const createAssetRoutes = (services/*: Services*/, options/*: RestOptions*/)/*: Route[]*/ => {
  const getRawAsset = async ({ query: { assetId }, headers }) => {
    if (!assetId)
      throw new MissingParameterError("assetId");
    const asset = await services.asset.database.getAsset(assetId);
    const assetBuffer = await services.asset.buffer.read(assetId)
    // ignore everything but the first range
    const range = getRangeRequests(headers, assetBuffer);
    if (!range) {
      // $FlowFixMe
      return streamOk(Readable.from(assetBuffer), {
        'content-length': assetBuffer.byteLength.toString(),
        'content-type': asset.contentType,
        'accept-ranges': 'bytes',
        'access-control-allow-origin': '*',
      });
    } else {
      const [{ start, end }] = range;
      const slicedBuffer = assetBuffer.slice(start, end);
      // $FlowFixMe
      return createStreamResponse(206, Readable.from(slicedBuffer), {
        'content-length': slicedBuffer.byteLength.toString(),
        'content-type': asset.contentType,
        'content-range': `bytes ${start}-${end - 1}/${assetBuffer.byteLength}`,
        'accept-ranges': 'bytes',
      })
    }
  };
  const postRawAsset = async ({ query: { assetId, tokenSecret }, content, auth }) => {
    if (!assetId)
      throw new MissingParameterError("assetId");
    if (!content)
      throw new BadRequestBodyError("Expected body to contain content greater than zero length");
    const asset = await services.asset.database.getAsset(assetId);
    const { contentLength } = content;
    if (!contentLength)
      throw new BadRequestBodyError("Expected to provide a content length header");
    if (tokenSecret) {
      await services.asset.buffer.writeWithToken(
        tokenSecret,
        Date.now(),
        await streamToBuffer(content.stream, contentLength),
        assetId,
      );
    } else {
      const user = await services.auth.getUser(auth);
      await services.asset.buffer.write(
        user,
        await streamToBuffer(content.stream, contentLength),
        assetId
      );
    }
    const assetBuffer = await services.asset.buffer.read(assetId);
    const location = await services.asset.url.createGETAssetURL(assetId);
    // $FlowFixMe
    return streamCreated(Readable.from(assetBuffer), {
      'location': location,
      'content-length': assetBuffer.byteLength.toString(),
      'content-type': asset.contentType,
    });
  };
  const rawAssetsRoutes = resource('/assets/raw', {
    get: withErrorHandling(getRawAsset),
    post: withErrorHandling(postRawAsset),
  }, options);

  const getAudioAssets = createAPIEndpointHandler(getAudioAssetEndpoint, async (_0, _1, { auth }) => {
    const user = await services.auth.getUser(auth);
    const audioAssets = await services.asset.database.listAudioAssets(user);

    return [200, audioAssets];
  });

  const postAudioAsset = createAPIEndpointHandler(postAudioAssetEndpoint, async ({}, { name, contentType }, { auth }) => {
    const user = await services.auth.getUser(auth);
    const audioAsset = await services.asset.database.addAudioAsset(user, name, contentType);
    const postURL = await services.asset.url.createPOSTAssetURL(audioAsset.assetId);
    
    return [201, {
      audioAsset,
      postURL,
    }];
  });

  const assetRoutes = resource('/assets/audio', {
    get: withErrorHandling(getAudioAssets),
    post: withErrorHandling(postAudioAsset),
  }, options);

  return [
    ...assetRoutes,
    ...rawAssetsRoutes,
  ];
};

module.exports = {
  createAssetRoutes,
};
