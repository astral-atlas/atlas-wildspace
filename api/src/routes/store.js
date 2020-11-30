// @flow strict
/*:: import type { Services } from '../services'; */
/*:: import type { RouteResponse, ResourceRequest, Route, ResourceOptions } from '@lukekaalim/server'; */

const { resource, ok } = require("@lukekaalim/server");
const { InvalidPermissionError, MissingParameterError, NonexistentResourceError, BadContentType } = require("../errors");
const { withErrorHandling } = require("./utils");
const { toGame, toPlayer } = require('@astral-atlas/wildspace-models');

/*
/stores/ids =>
  GET: list all stores by id 
/stores?id=${storeID} =>
  GET: get a particular store and all its keys and values
/stores/store/value?id=${storeID}&key=${key} =>
  GET: get a particular value in a store
  POST: create or update a particular value in the store
*/
const createStoreRoutes = (services/*: Services*/, options/*: ResourceOptions*/)/*: Route[] */ => {
  const stores = {
    'player': services.stores.player,
    'game': services.stores.game,
  };
  const toStoreId = (value)/*: $Keys<typeof stores>*/ => {
    switch (value) {
      case 'player':
      case 'game':
        return value;
      default:
        throw new TypeError();
    }
  };
  const updateStore = async (storeId, key, value) => {
    switch (storeId) {
      case 'player':
        return await stores.player.set(key, toPlayer(value));
      case 'game':
        return await stores.game.set(key, toGame(value));
    }
  }
  const listAllStores = async ({ auth }) => {
    const user = await services.auth.getUser(auth);
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('StoreList', 'Only Game Masters use the /stores endpoints');
    return ok([...Object.keys(stores)]);
  };
  const readStore = async ({ params: { storeId: storeIdParam }, auth }) => {
    const user = await services.auth.getUser(auth);
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('StoreList', 'Only Game Masters use the /stores endpoints');
    if (!storeIdParam)
      throw new MissingParameterError(`storeId`);
    const storeId = toStoreId(storeIdParam);
    const store = stores[storeId];
    if (!store)
      throw new NonexistentResourceError(storeId, `Store not found`);
    const values = [...store.values].map(([key, value]) => ({ key, value }));
    return ok({ id: storeId, values });
  };
  const updateValue = async ({ params: { storeId: storeIdParam, key }, auth, content }) => {
    const user = await services.auth.getUser(auth);
    if (user.type !== 'game-master')
      throw new InvalidPermissionError('StoreList', 'Only Game Masters use the /stores endpoints');
    if (!storeIdParam)
      throw new MissingParameterError(`storeId`);
    if (content.type !== 'json')
      throw new BadContentType('application/json');
    
    const storeId = toStoreId(storeIdParam);
    await updateStore(storeId, key, content.value);
    const store = stores[storeId];

    const values = [...store.values].map(([key, value]) => ({ key, value }));
    return ok({ id: storeId, values });
  };

  const storeIdResource = resource('/stores/ids', {
    read: withErrorHandling(listAllStores)
  }, options);
  const storeResource = resource('/stores', {
    read: withErrorHandling(readStore)
  }, options);
  const valueResource = resource('/stores/value', {
    update: withErrorHandling(updateValue), 
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