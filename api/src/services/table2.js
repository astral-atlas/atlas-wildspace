// @flow strict
const { writeFile, readFile, mkdir } = require('fs').promises;
const { toArray, toObject } = require('@lukekaalim/cast');
const { dirname } = require('path');

/*::
export type SelectOptions = {
  offset?: number,
  limit?: number,
};

type ColumnValue = { table?: ?string, column: string, value: string };

export type ReadableTable<Row: {}> = {
  name: string,
  select: (columns: ColumnValue[], options?: SelectOptions) => Promise<Row[]>,
};
export type WritableTable<Row: {}> = {
  name: string,
  insert: (rows: Row[]) => Promise<void>,
  update: (where: ColumnValue[], values: ColumnValue[]) => Promise<void>,
  remove: (where: ColumnValue[]) => Promise<void>
};
export type Table<Row: {}> = ReadableTable<Row> & WritableTable<Row>;
*/

const createMemoryTable = /*:: <Row: {}>*/(name/*: string*/, initialRows/*: $ReadOnlyArray<Row>*/ = [])/*: Table<Row>*/ => {
  let rows/*: Row[]*/ = [...initialRows];

  const columnsMatchRow = (columnValues, row) => columnValues
    .filter(({ table }) => !table)
    .every(({ column, value }) => row[column] === value);
  const updateRow = (columnValues, row) => {
    const newRow = { ...row };
    for (const { table, column, value } of columnValues)
      if (!table || table === name)
        newRow[column] = value;
    return newRow;
  }

  const select = async (columns, { offset = 0, limit = 0 } = {}) => rows
    .filter(row => columnsMatchRow(columns, row))
    .slice(
      offset,
      offset + (limit || rows.length)
    );
  const insert = async (newRows) => void (rows = [...newRows, ...rows]);
  const remove = async (columns) => void (rows = [...rows]
    .filter(row => !columnsMatchRow(columns, row)))
  const update = async (where, values) => void (rows = [...rows]
    .map(row => columnsMatchRow(where, row) ? updateRow(values, row) : row))

  return {
    name,
    select,
    insert,
    remove,
    update,
  };
};

// TODO:
const readJSONFile = async (path/*: string*/, defaultContent/*: mixed*/)/*: Promise<any>*/ => {
  try {
    const content = await readFile(path, 'utf8');
    const value = JSON.parse(content);
    return value;
  } catch (error) {
    return defaultContent;
  }
};

const createFileTable = async /*:: <Row: {}>*/(name/*: string*/, file/*: string*/)/*: Promise<Table<Row>>*/ => {
  const internalTable/*: Table<Row>*/ = createMemoryTable(name, await readJSONFile(file, []));

  const select = async (columns, options) => {
    return await internalTable.select(columns, options);
  }
  const insert = async (newRows) => {
    await internalTable.insert(newRows);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(await internalTable.select([]), null, 2));
  };
  const remove = async (columns) => {
    await internalTable.remove(columns);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(await internalTable.select([]), null, 2));
  };
  const update = async (where, values) => {
    await internalTable.update(where, values);
    await mkdir(dirname(file), { recursive: true });
    await writeFile(file, JSON.stringify(await internalTable.select([]), null, 2));
  };

  return {
    name,
    select,
    insert,
    remove,
    update,
  };
};

const createMemoryJoin = /*::<RA: {}, RB: {}> */(
  name/*: string*/,
  tableA/*: ReadableTable<RA>*/,
  tableB/*: ReadableTable<RB>*/,
  join/*: { a: $Keys<RA>, b: $Keys<RB> }*/
)/*: ReadableTable<{ ...$Exact<RA>, ...$Exact<RB> }>*/ => {
   const select = async (columns, options) => {
    const columnsA = columns
      .filter(({ table }) => table === tableA.name)
      .map(({ column, value }) => ({ column, value }));
    
    const columnsB = columns
      .filter(({ table }) => table === tableB.name)
      .map(({ column, value }) => ({ column, value }));
    
    const rowsA = await tableA.select(columnsA);
    const rowsB = await tableB.select(columnsB);

    return rowsA.map((rowA)/*: ({ ...RA, ...RB })[]*/ => {
      return rowsB.map(rowB => {
        if (rowA[join.a] === rowB[join.b])
          return { ...rowA, ...rowB };
        return null;
      }).filter(Boolean);
    }).flat(1);
   };

   return {
     name,
     select,
   }
};

module.exports = {
  createMemoryTable,
  createFileTable,
  createMemoryJoin,
};