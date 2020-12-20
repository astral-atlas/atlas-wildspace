// @flow strict
const { request } = require('http');
const { createInterface } = require('readline');
const { createWildspaceClient } = require('@astral-atlas/wildspace-client');
const { createNodeClient } = require('@lukekaalim/http-client');

const { readFile } = require('fs').promises;

global.WebSocket = require('isomorphic-ws')

const user = {
  type: 'game-master',
  gameMaster: {
    name: 'Luke Kaalim',
    id: 'luke',
  },
};

const cli = async () => {
  const [nodeExec, entryLoc, ...args] = process.argv;
  const [command, ...commandArgs] = args;

  const http = createNodeClient(request);
  const authDetails = {
    user: { type: 'game-master', gameMasterId: 'luke' },
    secret: 'bothways',
  };
  const client = createWildspaceClient(
    new URL('http://localhost:8080'),
    new URL('ws://localhost:8080'),
    http, authDetails
  );
  
  try {
    await client.table.addRow('games', { gameId: '002', name: 'cool game', creator: 'luke' })
    console.log(await client.table.getTable('games'));
    console.log(await client.table.getTable('playersInGames'));
  } catch (error) {
    console.error(error);
  }
};

cli();