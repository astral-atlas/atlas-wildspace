// @flow strict
/*:: import type { Services } from '../services'; */
/*:: import type { RestOptions, Route } from '@lukekaalim/server'; */
/*:: import type { ReadWriteTable } from '@astral-atlas/table'; */
const { toObject, toNullable, toString, toArray } = require("@lukekaalim/cast");
const { toColumnMap } = require('@astral-atlas/table');
const { resource, json: { ok, created, noContent } } = require("@lukekaalim/server");
const { withErrorHandling } = require("./utils");

const toPOSTTableRowBody = (value) => {
  const object = toObject(value);
  return {
    row: toObject(object.row),
  };
}
const toPATCHTableRowBody = (value) => {
  const object = toObject(value);
  return {
    where: toColumnMap(object.where),
    values: toColumnMap(object.values),
  };
}
const toDELETETableRowBody = (value) => {
  const object = toObject(value);
  return {
    where: toColumnMap(object.where),
  };
}

const createTableRoutes = (services/*: Services*/, options/*: RestOptions*/)/*: Route[]*/ => {
  const tables/*: { +[string]: ReadWriteTable<any> }*/ = {
    games: services.tables.game.games,
    playersInGames: services.tables.game.playersInGames,
    activeTracks: services.tables.audio.activeTracks,
    backgroundTracks: services.tables.audio.backgroundTracks,
    audioAssets: services.tables.asset.audioAssets,
    assets: services.tables.asset.assets,
    assetPushTokens: services.tables.asset.assetPushTokens,
  };
  const getTable = async ({ query: { name } }) => {
    const table = tables[name];
    const rows = await table.select({});
    return ok(rows);
  };
  const postTableRow = async ({ query: { name }, parseJSON }) => {
    const { row } = toPOSTTableRowBody((await parseJSON()).value);
    const table = tables[name];
    await table.insert([row])
    return created();
  };
  const patchTableRow = async ({ query: { name }, parseJSON }) => {
    const { where, values } = toPATCHTableRowBody((await parseJSON()).value);
    const table = tables[name];
    const updatedRows = await table.update(where, values);
    return ok(updatedRows);
  };
  const removeTableRow = async ({ query: { name }, parseJSON }) => {
    const { where } = toDELETETableRowBody((await parseJSON()).value);
    const table = tables[name];
    await table.remove(where);
    return noContent();
  };
  const tableResource = resource('/table', {
    get: withErrorHandling(getTable),
  }, options);
  const tableRowResource = resource('/table/row', {
    post: withErrorHandling(postTableRow),
    patch: withErrorHandling(patchTableRow),
    delete: withErrorHandling(removeTableRow),
  }, options);
  return [
    ...tableResource,
    ...tableRowResource,
  ];
};

module.exports = {
  createTableRoutes,
};