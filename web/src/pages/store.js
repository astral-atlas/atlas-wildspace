// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { Store } from '@astral-atlas/wildspace-client'; */
/*:: import type { GameID } from '@astral-atlas/wildspace-models'; */
import { toActiveTrackEvent, toActiveTrackRow } from '@astral-atlas/wildspace-models';
import { h } from 'preact';
import { useWildspaceClient, useAsync, useActiveGame } from '../hooks/useWildspace';
import { useEffect, useState } from 'preact/hooks';
import { stringify, toObject, toString } from '@lukekaalim/cast';
import { TableAdmin } from '../components/table';
import { ConnectionAdmin } from '../components/connection';

const style = `
  .store-page {
    width: 100%;
    padding: 32px;
    box-sizing: border-box;
  }
  form {
    width: 100%;
    overflow-y: scroll;
  }
  .store-table-container {
    width: 100%;
    padding-bottom: 16px;
    overflow-y: scroll;
  }
  table.store {
    width: 100%;
    border: 1px solid black;
    border-collapse: collapse;
    border-spacing: 0px;
  }
  table.store td {
    border: 1px solid black;
    padding: 4px;
  }
  table.store h2 {
    text-align: center;
  }
  table.store tr.header {
    
  }
  table.store td {
    min-width: 10em;
  }
  table.store tr.new {
    text-align: center;
  }
  table.store tr.new td {
    text-align: center;
    padding: 0px;
  }
  table.store tr.new button {
    width: 100%;
    height: 100%;
    border: 0;
    background: none;
    cursor: pointer;
  }
  table.store tr.new input {
    padding: 2px;
    margin: 0;
    width: 100%;
    height: 2em;
    border: 0;
    background: none;
  }
  tr th pre {
    margin: 0;
  }
`;

/*::
type StoreTableProps = {
  storeId: string,
  fields: { name: string, type?: string }[],
  lastUpdated: number,
}
*/

const getDefaultValue = field => {
  if (!field.type)
    return '';
  switch (field.type) {
    case 'string':
      return '';
    case 'number':
      return '0';
    case 'array(string)':
      return '[]';
    default:
      return 'null';
  }
}

const StoreTable = ({ storeId, fields }/*: StoreTableProps*/) => {
  const [lastUpdated, setLastUpdated] = useState(Date.now());
  const client = useWildspaceClient();
  const [store] = useAsync(async () => await client.store.getStore(storeId), [client, lastUpdated]);

  const [inputRowKey, setInputRowKey] = useState('');
  const [inputRowValues, setInputRowValues] = useState(fields.map(getDefaultValue));
  const getValueText = (field, key, value) => {
    const object = toObject(value);
    return JSON.stringify(object[field.name]);
  }

  if (!store)
    return null;

  const onSubmit = async (e) => {
    e.preventDefault();
    const object = Object.fromEntries(
      fields.map((field, index) =>
        [field.name, JSON.parse(inputRowValues[index] || '""')]));
    await client.store.setStoreValue(store.id, inputRowKey, object);
    setLastUpdated(Date.now());
    setInputRowValues(fields.map(getDefaultValue));
  };

  const header = h('tr', { class: 'header' }, [
    h('th', { key: 'key' }, h('pre', {}, 'key')),
    ...fields.map(field =>
      h('th', { key: field.name }, h('pre', {}, field.name))),
    h('th', { key: 'controls' }, h('pre', {}, 'controls')),
  ]);
  const rows = store.values.map(({ key, value }) => (
    h('tr', { key: key, class: 'value' }, [
      h('td', {}, key),
      ...fields.map(field =>
        h('td', { key: field.name }, getValueText(field, key, value)),
      ),
      h('td', { key: 'delete' }, [
        h('button', { onClick: async (e) => {
          e.preventDefault();
          await client.store.setStoreValue(store.id, key, null);
          setLastUpdated(Date.now());
        }}, 'Delete'),
        h('button', { onClick: async (e) => {
          e.preventDefault();
          setInputRowKey(key);
          setInputRowValues(fields.map(field => JSON.stringify(value[field.name])));
        }}, 'Edit'),
    ]),
    ],
  )));
  const inputRow = h('tr', { class: 'new' }, [
    h('td', {}, h('input', { placeholder: 'key', type: 'text', value: inputRowKey, onInput: e => setInputRowKey(e.currentTarget.value) })),
    ...fields.map((field, fieldIndex) =>
      h('td', {}, h('input', { type: 'text', value: inputRowValues[fieldIndex], onInput: e => {
        const newRow = [...inputRowValues];
        newRow[fieldIndex] = e.currentTarget.value;
        setInputRowValues(newRow);
      }, placeholder: field.type }))
    ),
    h('td', { key: 'delete' }, [
      h('button', { onClick: async (e) => {
        e.preventDefault();
        setInputRowKey('');
        setInputRowValues(fields.map(getDefaultValue));
      }}, 'Clear'),
    ]),
  ]);
  return h('form', { onSubmit }, [
    h('h2', {}, store.id),
    h('div', { class: 'store-table-container' }, h('table', { class: 'store' }, [
      header,
      ...rows,
      inputRow,
    ])),
    h('input', { type: 'submit', value: 'Input new Row' }),
  ]);
};

const toGameRow = (value/*: mixed*/) => {
  const object = toObject(value);
  return {
    gameId: toString(object.gameId),
    creator: toString(object.creator),
    name: toString(object.name),
  }
};
const toPlayerInGameRow = (value/*: mixed*/) => {
  const object = toObject(value);
  return {
    gameId: toString(object.gameId),
    playerId: toString(object.playerId),
  }
};

const StorePage = ()/*: Node*/ => {
  const client = useWildspaceClient();
  const [ids] = useAsync(async () => client.game.getGameIds(), [client]);
  const [selectedId, setSelectedId] = useState/*:: <?GameID>*/(null);
  const [connection] = useAsync(async () =>
    ids && selectedId && client.audio.connectActiveTrack(selectedId), [ids, client, selectedId]);

  return h('main', { class: 'store-page' }, [
    h('h2', {}, 'Admin Data Store Page'),
    h('style', {}, style),
    ids && h('select', { value: selectedId, onChange: e => setSelectedId(e.currentTarget.value) }, [
      ...ids.map(id => h('option', { value: id }, id))
    ]),
    h(ConnectionAdmin, {
      toEvent: toActiveTrackEvent,
      connection,
      eventTypes: {
        update: {
          'type': { type: 'literal', value: 'update' },
          'distanceSeconds': { type: 'number' },
          'fromUnixTime': { type: 'number' },
          'trackId': { type: 'text' },
        },
      },
    }),

    h(TableAdmin, {
      name: 'games',
      columnTypes: {
        'gameId': 'text',
        'creator': 'text',
        'name': 'text',
      },
      toRow: toGameRow,
      rowToKey: row => ({ gameId: row.gameId })
    }),
    h(TableAdmin, {
      name: 'playersInGames',
      columnTypes: {
        'gameId': 'text',
        'playerId': 'text'
      },
      toRow: toPlayerInGameRow,
      rowToKey: row => ({ gameId: row.gameId, playerId: row.playerId }),
    }),
    h(TableAdmin, {
      name: 'activeTracks',
      columnTypes: {
        'gameId': 'text',
        'distanceSeconds': 'number',
        'fromUnixTime': 'number',
        'trackId': 'text'
      },
      toRow: toActiveTrackRow,
      rowToKey: row => ({ gameId: row.gameId })
    }),
    h(StoreTable, { storeId: 'character',
      fields: [
        { name: 'id' },
        { name: 'game' },
        { name: 'player' },
        { name: 'name' },
        { name: 'description' },
        { name: 'imageURL' },
        { name: 'hitPoints' },
        { name: 'armorClass' },
        { name: 'conditions', type: 'array(string)' },
      ] }),
    h(StoreTable, { storeId: 'player',
      fields: [
        { name: 'id' },
        { name: 'name' },
      ] }),
    h(StoreTable, { storeId: 'playerSecrets',
      fields: [
        { name: 'secret' },
      ] }),
    h(StoreTable, { storeId: 'sources',
      fields: [
        { name: 'id' },
        { name: 'resource' },
      ] }),

    h(StoreTable, { storeId: 'tracks',
      fields: [
        { name: 'id' },
        { name: 'name' },
        { name: 'source' },
        { name: 'gameId' },
      ] }),
  ]);
};

export {
  StorePage,
};
