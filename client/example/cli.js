// @flow strict
const { request } = require('http');
const { createWildspaceClient } = require('../main');
const { createNodeClient } = require('@lukekaalim/http-client');

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
  const client = createWildspaceClient(new URL('http://localhost:8080'), http, user, 'bothways');

  const getGame = async (gameId/*: string*/) => {
    const game = await client.game.getGame(gameId);
    console.log(game);
  };
  const createGame = async () => {
    const game = await client.game.createGame();
    console.log(game);
  }

  const gameCommands = async (command, ...commandArgs) => {
    switch (command) {
      case 'create':
        return await createGame();
      case 'read':
        return await getGame(...commandArgs);
    }
  }
  
  try {
    switch (command) {
      case 'game':
        return await gameCommands(...commandArgs);
    }
  } catch (error) {
    console.error(error);
  }
};

cli();