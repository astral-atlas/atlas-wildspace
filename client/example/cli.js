// @flow strict
const { request } = require('http');
const { createInterface } = require('readline');
const { createWildspaceClient } = require('@astral-atlas/wildspace-client');
const { createNodeClient } = require('@lukekaalim/http-client');

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
  const client = createWildspaceClient(new URL('http://localhost:8080'), http, authDetails);
  
  try {
    const ids = await client.game.getGameIds();
    const games = await Promise.all(ids.map(id => client.game.getGame(id)));

    const readline = createInterface({
      input: process.stdin,
      output: process.stdout,
    });
    games.map(async game => {
      try {
        const connection = await client.audio.connectActiveTrack(game.id, e => console.log(e));
        readline.on('line', line => connection.set(line.length === 0 ? null : line, 0, 0));
      } catch (error) {
        console.error(error);
      }
    })
    console.log(games);
    //client.audio.connectActiveTrack();
  } catch (error) {
    console.error(error);
  }
};

cli();