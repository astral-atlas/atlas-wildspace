#!/usr/bin/env node
// @flow strict

import { handleBucketCommand } from "./bucket.js";
import { handleCharacterCommand } from "./characters.js";


const main = (command, ...subcommands) => {
  switch (command) {
    case 'character':
      return handleCharacterCommand(...subcommands);
    case 'bucket':
      return handleBucketCommand()
    default:
      return console.log('No idea, boss');
  }
};

main(...process.argv.slice(2));