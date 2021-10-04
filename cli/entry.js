#!/usr/bin/env node
// @flow strict

import { initFileData } from "./init.js";


const main = (command, ...params) => {
  switch (command) {
    case 'init':
      return initFileData(...params);
    default:
      return console.log('No idea, boss');
  }
};

main(...process.argv.slice(2));