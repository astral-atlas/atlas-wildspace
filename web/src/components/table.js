// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { StyleSheet } from '../lib/style'; */
import { h } from 'preact';
import { useState } from 'preact/hooks';
import { useAsync } from '../hooks/useAsync';
import { useWildspaceClient } from '../hooks/useWildspace';
import { cssClass, cssStylesheet } from '../lib/style';

const tableClass = cssClass('admin-table', {
  'border': '1px solid black',
  'border-collapse': 'collapse',
  'border-spacing': '0px',
});
const tableRowClass = cssClass('admin-table-row', {
  'border': '1px solid black',
  'border-collapse': 'collapse',
  'border-spacing': '0px',
});
const tableCellClass = cssClass('admin-table-cell', {
  'border': '1px solid black',
  'border-collapse': 'collapse',
  'border-spacing': '0px',
  'padding': '8px'
});
const tableCaption = cssClass('admin-table-caption', {
  'text-align': 'left'
});

export const tableAdminStyle/*: StyleSheet*/ = cssStylesheet([
  tableCaption,
  tableClass,
  tableCellClass,
  tableRowClass,
]);

/*::
export type TableAdminProps<T, K> = {
  name: string,
  columnTypes: { [$Keys<T>]: 'text' | 'number' },
  toRow: mixed => T,
  rowToKey: T => K,
};
*/
export const TableAdmin = /*::<T: { [string]: mixed }, K>*/({ name, columnTypes, toRow, rowToKey }/*: TableAdminProps<T, K>*/)/*: Node*/ => {
  const client = useWildspaceClient();
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const [table] = useAsync(async () => client.table.getTable(name), [name, lastUpdated]);

  const [editableRow, setEditableRow] = useState({});

  if (!table)
    return null;
  const rows = table.map(toRow);
  const columns = Object.keys(columnTypes);

  const onSubmit = async (e) => {
    e.preventDefault();
    const newRow = toRow(editableRow);
    await client.table.addRow(name, newRow);
    setLastUpdated(Date.now());
  };
  const onTextInput = (column) => (event) => {
    setEditableRow({
      ...editableRow,
      [column]: event.currentTarget.value,
    })
  };
  const onNumberInput = (column) => (event) => {
    setEditableRow({
      ...editableRow,
      [column]: parseFloat(event.currentTarget.value),
    })
  };
  const onEdit = (row) => (e) => {
    e.preventDefault();
    setEditableRow(row);
  };
  const onDelete = (row) => async (e) => {
    e.preventDefault();
    await client.table.removeRow(name, rowToKey(row));
    setLastUpdated(Date.now());
  }

  return h('form', { onSubmit, autoComplete: "off" }, h('table', { class: 'admin-table' }, [
    h('caption', { class: 'admin-table-caption' }, name),
    h('thead', {}, [
      h('tr', { class: 'admin-table-row' }, [
        ...columns.map(column => h('th', { class: 'admin-table-cell' },
          column)),
        h('th', { class: 'admin-table-cell' }, 'Controls')
      ]),
    ]),
    rows.length > 0 && h('tbody', {}, [
      ...rows.map(row => h('tr', { class: 'admin-table-row' }, [
        ...columns.map(column => h('td', { class: 'admin-table-cell' },
          row[column])),
        h('td', { class: 'admin-table-cell' }, [
          h('button', { type: 'button', onClick: onEdit(row) }, 'Start Editing'),
          h('button', { type: 'button', onClick: onDelete(row) }, 'Delete'),
        ]),
      ])),
    ]),
    h('tfoot', {}, [
      h('tr', { class: 'admin-table-row' }, [
        ...columns.map(column => {
            switch(columnTypes[column]) {
              case 'text':
                return h('td', { class: 'admin-table-cell' },
                  h('input', { type: 'text', value: editableRow[column], onInput: onTextInput(column) }));
              case 'number':
                return h('td', { class: 'admin-table-cell' },
                  h('input', { type: 'number', value: editableRow[column], onInput: onNumberInput(column) }));
            }
          }),
        h('td', { class: 'admin-table-cell' }, [
          h('input', { type: 'submit', onClick: onSubmit }, 'Push to Table'),
        ]),
      ])
    ])
  ]));
};