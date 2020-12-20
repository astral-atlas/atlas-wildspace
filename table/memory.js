// @flow strict
/*::
import type { ColumnMap, Selectable, Insertable, Named } from './main.js';

export type MemoryTable<Row: ColumnMap> =
  & Selectable<Row>
  & Insertable<Row>
  & Named
*/

const createMemoryTable = /*:: <R: ColumnMap>*/(name/*: string*/)/*: MemoryTable<R>*/ => {
  let rows = [];

  const rowMatchesColumns = (row, columnMap) => {
    const columnNames = Object.keys(columnMap);
    return columnNames.every(name => columnMap[name] === row[name]);
  }
  const updateRow = (row, columnMap) => {
    return {
      ...row,
      ...columnMap,
    };
  }

  const select = async (where, { limit = rows.length, offset = 0 } = {}) => {
    return rows
      .filter(row => rowMatchesColumns(row, where))
      .slice(offset, offset + limit)
  };
  const insert = async (newRows) => {
    rows = [...newRows, ...rows];
  }
  const update = async (where, values) => {
    rows = rows
      .map(row => rowMatchesColumns(row, where) ? updateRow(row, values) : row)
  };
  const remove = async (where) => {
    rows = rows
      .filter(row => !rowMatchesColumns(row, where))
  }

  return {
    name,
    select,
    insert,
    update,
    remove,
  }
};

module.exports = {
  createMemoryTable,
};
