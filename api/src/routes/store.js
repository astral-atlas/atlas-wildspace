// @flow strict
/*:: import type { Services } from '../services'; */
/*:: import type { RouteResponse, ResourceRequest, Route, RestOptions } from '@lukekaalim/server'; */

const { resource, json: { ok } } = require("@lukekaalim/server");
const { InvalidPermissionError, MissingParameterError, NonexistentResourceError, BadContentType } = require("../errors");
const { withErrorHandling } = require("./utils");
const { toGame, toPlayer, toCharacter, toBackgroundAudioTrack, toHTTPAudioSource } = require('@astral-atlas/wildspace-models');
const { toString, toObject } = require("@astral-atlas/wildspace-models/casting");

const stores = [
  { id: 'player', cast: toPlayer },
  { id: 'playerSecrets', cast: v => {
    const o = toObject(v);
    return {
      secret: toString(o.secret),
    }
  } },
  { id: 'game', cast: toGame },
  { id: 'character', cast: toCharacter },
  { id: 'tracks', cast: toBackgroundAudioTrack },
  { id: 'sources', cast: toHTTPAudioSource },
];

/*
/stores/ids =>
  GET: list all stores by id 
/stores?id=${storeID} =>
  GET: get a particular store and all its keys and values
/stores/store/value?id=${storeID}&key=${key} =>
  GET: get a particular value in a store
  POST: create or update a particular value in the store
*/
const createStoreRoutes = (services/*: Services*/, options/*: RestOptions*/)/*: Route[] */ => {
  const storeServices = stores.map(store => services.stores[store.id]);

  const getStoreService = id => {
    const index = stores.findIndex(store => store.id === id);
    return storeServices[index];
  }
  
  const updateStore = async (storeId, key, value) => {
    const store = getStoreService(storeId);
    if (value === null)
      return await store.set(key, null);
    
    const cast = stores.find(store => store.id === storeId)?.cast;
    // Forgive me, flow. This is very dangerous btw
    // $FlowFixMe
    return await store.set(key, cast(value));
  }
  const listAllStores = async ({ auth }) => {
    const user = await services.auth.getUser(auth);
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('StoreList', 'Only Game Masters use the /stores endpoints');
    return ok(stores.map(store => store.id));
  };
  const readStore = async ({ query: { storeId }, auth }) => {
    const user = await services.auth.getUser(auth);
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('StoreList', 'Only Game Masters use the /stores endpoints');
    if (!storeId)
      throw new MissingParameterError(`storeId`);
    const store = getStoreService(storeId);
    if (!store)
      throw new NonexistentResourceError(storeId, `Store not found`);
    const values = [...store.values].map(([key, value]) => ({ key, value }));
    return ok({ id: storeId, values });
  };
  const updateValue = async ({ query: { storeId, key }, auth, parseJSON }) => {
    const user = await services.auth.getUser(auth);
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('StoreList', 'Only Game Masters use the /stores endpoints');
    if (!storeId)
      throw new MissingParameterError(`storeId`);
    const content = await parseJSON();
    if (!content)
      throw new BadContentType('application/json');
    await updateStore(storeId, key, content.value);
    const store = getStoreService(storeId);

    const values = [...store.values].map(([key, value]) => ({ key, value }));
    return ok({ id: storeId, values });
  };

  const storeIdResource = resource('/stores/ids', {
    get: withErrorHandling(listAllStores)
  }, options);
  const storeResource = resource('/stores', {
    get: withErrorHandling(readStore)
  }, options);
  const valueResource = resource('/stores/value', {
    put: withErrorHandling(updateValue), 
  }, options);

  return [
    ...storeIdResource,
    ...storeResource,
    ...valueResource,
  ];
};

module.exports = {
  createStoreRoutes,
};