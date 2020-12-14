// @flow strict
const { writeFile, readFile, mkdir } = require('fs').promises;
const { dirname } = require('path');

/*::
export type SelectOptions = {
  offset?: number,
  limit?: number,
};

export type ReadableTable<Key, Row> = {|
  select: (key: Key, options?: SelectOptions) => Promise<Row[]>,
  count: (key: Key, options?: SelectOptions) => Promise<number>,
|};
export type WritableTable<Key, Row> = {|
  remove: (key: Key) => Promise<void>,
  insert: (rows: Row[]) => Promise<void>,
  update: (key: Key, partialRow: $Shape<Row>) => Promise<Row[]>,
|};

export type Table<Key, Row> = {
  ...ReadableTable<Key, Row>,
  ...WritableTable<Key, Row>,
};

export type TableConstraints = {
  uniqueKeyConstraints: string[][],
};

type ReducerFunc<T> = (acc: T[], curr: T) => T[];
*/

const memoryJoin = /*:: <RowA: {}, RowB: {}, KeyA, KeyB, JoinedKey, JoinedRow>*/(
  tableA/*: Table<KeyA, RowA>*/,
  tableB/*: Table<KeyB, RowB>*/,
  joinedKeyToKeyA/*: JoinedKey => KeyA*/,
  joinedKeyToKeyB/*: JoinedKey => KeyB*/,
  joinRows/*: (a: RowA, b: RowB) => JoinedRow*/,
  toRowA/*: JoinedRow => RowA*/,
  toRowB/*: JoinedRow => RowB*/,
)/*: Table<JoinedKey, JoinedRow>*/ => {
  const select = async (key) => {
    const rowsA = await tableA.select(joinedKeyToKeyA(key));
    const rowsB = await tableB.select(joinedKeyToKeyB(key));

    const joinedRows/*: JoinedRow[] */ = rowsA.map(rowA =>
      rowsB
        .map(rowB => joinRows(rowA, rowB))
        .filter(Boolean)
    ).flat(1);
    
    return joinedRows;
  };
  const count = async (key) => {
    return (await select(key)).length;
  };
  const insert = async (row) => {
    await tableA.insert(row.map(toRowA));
    await tableB.insert(row.map(toRowB));
  };
  const remove = async (key) => {
    await tableA.remove(joinedKeyToKeyA(key));
    await tableB.remove(joinedKeyToKeyB(key));
  };
  const update = async (key, row) => {
    await tableA.update(joinedKeyToKeyA(key), toRowA(row));
    await tableB.update(joinedKeyToKeyB(key), toRowB(row));
    return select(key);
  };

  return {
    select,
    count,
    insert,
    remove,
    update,
  };
};

const toUnique = /*::<T>*/(isEqual/*: (a: T, b: T) => boolean*/)/*: ReducerFunc<T>*/ => (acc, curr) => {
  if (acc.find(e => isEqual(curr, e)))
    return acc.map((v) => isEqual(v, curr) ? curr : v);
  return [...acc, curr];
};

const createMemoryTable = /*::<K: {}, R: {}>*/(
  initialRows/*: R[]*/ = [],
  isRowsEqual/*: (a: R, b: R) => boolean*/ = (a, b) => a === b,
)/*: Table<K, R> & { getInternalArray: () => R[] }*/ => {
  let rows = initialRows;
  
  const select = async (keys, { offset = 0, limit = rows.length } = {}) => {
    const columns = Object.keys(keys);
    return rows
      .filter(row => columns.every(key => row[key] === keys[key]))
      .slice(offset, offset + limit)
      .reduce(toUnique(isRowsEqual), [])
  };
  const insert = async (newRows) => {
    rows = [...rows, ...newRows]
      .reduce(toUnique(isRowsEqual), [])
  };
  const count = async (row, { offset = 0, limit = 0 } = {}) => {
    return (await select(row, { offset, limit })).length;
  };
  const remove = async (keys) => {
    const columns = Object.keys(keys);
    rows = rows
      .filter(row => !columns.every(key => row[key] === keys[key]))
  };
  const update = async (keys, newRow) => {
    const columns = Object.keys(keys);
    rows = rows
      .map(row => columns.every(key => row[key] === keys[key])
        ? ({ ...row, ...newRow })
        : row
      )
      .reduce(toUnique(isRowsEqual), [])
    return select(keys);
  };

  return {
    getInternalArray: () => rows,
    select,
    insert,
    count,
    remove,
    update,
  }
};

const toArray = (value) => {
  if (!Array.isArray(value))
    throw new TypeError();
  return value;
};

const tryDefault = async (func, defaultValue) => {
  try {
    return await func();
  } catch (error) {
    return defaultValue;
  }
};

const createFileTable = async /*::<K: {}, R: {}>*/(
  filePath/*: string*/,
  toRow/*: mixed => R*/,
  isRowsEqual/*: (a: R, b: R) => boolean*/ = (a, b) => a === b,
)/*: Promise<Table<K, R>>*/ => {
  const directory = dirname(filePath);
  await mkdir(directory, { recursive: true });
  const fileOrDefault = await tryDefault(async () => await readFile(filePath, 'utf8'), '[]');
  const initialRows = toArray(JSON.parse(fileOrDefault)).map(toRow);
  const internalTable = createMemoryTable/*:: <K, R>*/(initialRows, isRowsEqual);
  
  const writeToFile = async () => {
    await writeFile(filePath, JSON.stringify(internalTable.getInternalArray(), null, 2), 'utf8');
  }
  const withFilePersistance = async /*:: <T>*/(func/*: () => Promise<T>*/)/*: Promise<T>*/ => {
    const value = await func();
    await writeToFile();
    return value;
  }

  return {
    select: (key, options) => withFilePersistance(() => internalTable.select(key, options)),
    count: (key, options) => withFilePersistance(() => internalTable.count(key, options)),
    insert: (rows) => withFilePersistance(() => internalTable.insert(rows)),
    remove: (key) => withFilePersistance(() => internalTable.remove(key)),
    update: (key, row) => withFilePersistance(() => internalTable.update(key, row)),
  };
};

module.exports = {
  memoryJoin,
  createMemoryTable,
  createFileTable,
};
