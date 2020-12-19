// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
const { toObject, toString } = require('@lukekaalim/cast');

/*::
export type ColumnMap = {
  +[string]: null | string | number | boolean
};
export type Options = {
  limit?: number,
  offset?: number,
};

export type Named = {
  name: string,
};
export type Selectable<Row: ColumnMap> = {
  select: (where: ColumnMap, options?: Options) => Promise<Row[]>
};
export type Insertable<Row: ColumnMap> = {
  insert: (rows: Row[]) => Promise<void>,
  update: (where: ColumnMap, values: ColumnMap) => Promise<void>,
  remove: (where: ColumnMap) => Promise<void>,
};
export type ReadWriteTable<Row: ColumnMap> = Selectable<Row> & Insertable<Row>;

export type RowOfSelectable<T> = $Call<<V>(s: Selectable<V>) => V, T>;

export type * from './memory.js';
export type * from './file.js';
export type * from './join.js';
*/

const toColumnMap/*: Cast<ColumnMap>*/ = (value) => {
  const entries = Object.entries(toObject(value))
      .map(([name, value])/*: [string, string]*/ => [name, toString(value)]);
  return Object.fromEntries(entries);
};

module.exports = {
  toColumnMap,
  ...require('./memory'),
  ...require('./file'),
  ...require('./join'),
};