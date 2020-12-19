// @flow strict
/*:: import type { RESTClient } from './rest'; */
const { toArray } = require('@lukekaalim/cast');

/*::
export type TableClient = {
  getTable: (name: string) => Promise<$ReadOnlyArray<any>>,
  addRow: (name: string, row: any) => Promise<void>,
  updateRow: (name: string, where: any, values: any) => Promise<$ReadOnlyArray<any>>,
  removeRow: (name: string, where: any) => Promise<void>,
};
*/

const createTableClient = (rest/*: RESTClient*/)/*: TableClient*/ => {
  const getTable = async (name) => {
    const { content } = await rest.get({ resource: '/table', params: { name } });
    return toArray(content);
  };
  const addRow = async (name, row) => {
    await rest.post({ content: { row }, resource: '/table/row', params: { name } });
  };
  const updateRow = async (name, where, values) => {
    const { content } = await rest.put({ content: { where, values }, resource: '/table/row', params: { name } });
    return toArray(content);
  };
  const removeRow = async (name, where) => {
    await rest.delete({ content: { where }, resource: '/table/row', params: { name } });
  };

  return {
    getTable,
    addRow,
    updateRow,
    removeRow,
  };
};

module.exports = {
  createTableClient,
};
