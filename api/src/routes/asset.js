// @flow strict
/*:: import type { Services } from '../services' */
/*:: import type { RouteResponse, ResourceRequest, RestOptions, Route } from '@lukekaalim/server'; */
const { Readable } = require('stream');
const { json: { ok: jsonOk }, resource, stream: { ok: streamOk } } = require("@lukekaalim/server");
const { MissingParameterError, BadRequestBodyError } = require("../errors");
const { withErrorHandling, streamToBuffer } = require("./utils");

const createAssetRoutes = (services/*: Services*/, options/*: RestOptions*/)/*: Route[]*/ => {
  const getAsset = async ({ query: { assetId } }) => {
    if (!assetId)
      throw new MissingParameterError("assetId");
    const asset = await services.assets.retrieve(assetId);
    const { type } = await services.assets.info(assetId);
    // $FlowFixMe
    return streamOk(Readable.from(asset), {
      'content-length': asset.byteLength.toString(),
      'content-type': type,
    });
  };
  const postAsset = async ({ query: { name = 'Untitled Asset' }, content, auth }) => {
    const user = await services.auth.getUser(auth);
    if (!content)
      throw new BadRequestBodyError('Expected content in body');
    const { contentLength, contentType, stream } = content;
    if (!contentLength || !contentType)
      throw new BadRequestBodyError('Expected content-length and content-type header');
    const asset = await streamToBuffer(stream, contentLength)

    const id = await services.assets.store(user, contentType, asset, name);

    return jsonOk(id);
  };
  const deleteAsset = async ({ query: { assetId }, auth }) => {
    const user = await services.auth.getUser(auth);
    if (!assetId)
      throw new MissingParameterError("assetId");

    const asset = await services.assets.evict(user, assetId);

    return jsonOk(asset);
  };
  const listAssets = async ({ auth }) => {
    const user = await services.auth.getUser(auth);
    const assets = await services.assets.list(user);

    return jsonOk(assets);
  }
  const assetRoutes = resource('/assets', {
    get: withErrorHandling(getAsset),
    post: withErrorHandling(postAsset),
    delete: withErrorHandling(deleteAsset),
  }, options);
  const assetListRoutes = resource('/assets/ids', {
    get: withErrorHandling(listAssets),
  }, options);

  return [
    ...assetListRoutes,
    ...assetRoutes,
  ];
};

module.exports = {
  createAssetRoutes,
};
