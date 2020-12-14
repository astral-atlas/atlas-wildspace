// @flow strict
/*:: import type { Services } from '../services'; */
/*:: import type { RestOptions, Route } from '@lukekaalim/server'; */
/*:: import type { Table } from '../services/table'; */
const { toObject } = require("@lukekaalim/cast");
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
    key: toObject(object.key),
    row: toObject(object.row),
  };
}
const toDELETETableRowBody = (value) => {
  const object = toObject(value);
  return {
    key: toObject(object.key),
  };
}

const createTableRoutes = (services/*: Services*/, options/*: RestOptions*/)/*: Route[]*/ => {
  const tables/*: { +[string]: Table<any, any> }*/ = {
    games: services.tables.games,
    playersInGames: services.tables.playersInGames,
    activeTracks: services.tables.activeTracks,
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
    const { key, row } = toPATCHTableRowBody((await parseJSON()).value);
    const table = tables[name];
    const updatedRows = await table.update(key, row);
    return ok(updatedRows);
  };
  const removeTableRow = async ({ query: { name }, parseJSON }) => {
    const { key } = toDELETETableRowBody((await parseJSON()).value);
    const table = tables[name];
    await table.remove(key);
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