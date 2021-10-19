#!/usr/bin/env node
// @flow strict

import { handleCharacterCommand } from "./characters.js";


const main = (command, ...subcommands) => {
  switch (command) {
    case 'character':
      return handleCharacterCommand(...subcommands);
    default:
      return console.log('No idea, boss');
  }
};

main(...process.argv.slice(2));