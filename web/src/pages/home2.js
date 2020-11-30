// @flow strict
/*:: import type { Node } from 'preact'; */
import { Header } from '../components/header';
import { h } from 'preact';
import { toGame } from '@astral-atlas/wildspace-models';
import { useGames, useWildspaceClient, useAsync } from '../hooks/useWildspace';
import { useMemo, useState } from 'preact/hooks';

const style = `
  main {
    width: 100%;
  }
  table.store {
    resize: both;
    overflow: auto;
    width: 100%;
    border: 1px solid black;
    border-collapse: collapse;
    border-spacing: 0px;
  }
  table.store td {
    border: 1px solid black;
    padding: 4px;
  }
  table.store tr.header {
    
  }
  table.store tr.value {
    
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
`;

const HomePage = ()/*: Node*/ => {
  const client = useWildspaceClient();
  const [lastUpdated, setLastUpdated] = useState(Date.now());

  const playerStore = useAsync(async () => client.store.getStore('game'), [client, lastUpdated]);

  return h('main', {}, [
    h('style', {}, style),
    h(Header),
    playerStore && (
      h('h1', {}, playerStore.id),
      h('table', { class: 'store' }, [
        h('tr', { class: 'header' } ,[
          h('th', {}, 'id'),
          h('th', {}, 'playerIds'),
          h('th', {}, 'creatorId'),
        ]),
        ...playerStore.values.map(v => (
          h('tr', { class: 'value' }, [
            h('td', {}, toGame(v.value).id),
            h('td', {}, JSON.stringify(toGame(v.value).players, null, 0)),
            h('td', {}, toGame(v.value).creator),
          ])
        )),
        h('tr', { class: 'new' } ,[
          h('td', {}, h('button', { onClick: () => client.game.createGame([]).then(() => setLastUpdated(Date.now())) }, 'create')),
          h('td', {}, h('input', { type: 'text', placeholder: 'comma delimited' })),
          h('td', {}, '<self>'),
        ]),
      ])
    ),
  ].filter(Boolean));
};

export {
  HomePage,
};
