// @flow strict
/*::
import type { Cast } from '@lukekaalim/cast';
import type { ColumnMap, Selectable, Insertable, Named } from './main.js';

export type JoinedTable<Row: ColumnMap> =
  & Selectable<Row>
*/

const createMemoryJoinTable = /*:: <RowA: ColumnMap, RowB: ColumnMap, JoinedRow: ColumnMap>*/(
  tableA/*: Selectable<RowA> & Named*/,
  tableB/*: Selectable<RowB> & Named*/,
  toJoinedRow/*: (a: RowA, b: RowB) => ?JoinedRow*/
)/*: JoinedTable<JoinedRow>*/ => {
  const getColumnMapForTable = (columnMap, tableName)/*: ColumnMap*/ => Object.fromEntries(
    Object
      .entries(columnMap)
      .map(([columnName, columnValue])/*: null | [string, string | number | boolean]*/ => {
        const [columnNameInTable, tableNameOfColumn] = columnName.split('.', 2).reverse();
        if (
          typeof columnValue !== 'string' &&
          typeof columnValue !== 'number' &&
          typeof columnValue !== 'boolean'
        )
          return null;
        if (!tableName)
          return [columnNameInTable, columnValue];
        if (tableName !== tableNameOfColumn)
          return null;
        return [columnNameInTable, columnValue];
      })
      .filter(Boolean)
  );

  const select = async (where, { offset = 0, limit } = {}) => {
    const whereA = getColumnMapForTable(where, tableA.name);
    const whereB = getColumnMapForTable(where, tableB.name);

    const rowsA = await tableA.select(whereA);
    // $FlowFixMe
    const rowsB = await tableB.select(whereB);

    const rows = rowsA
      .map((rowA) => rowsB
          .map((rowB) => toJoinedRow(rowA, rowB))
          .filter(Boolean))
      .flat(1)
  
    return rows
      .slice(offset, offset + (limit || rows.length))
  };

  return {
    select,
  };
};

module.exports = {
  createMemoryJoinTable,
};
