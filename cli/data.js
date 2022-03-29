// @flow strict

import { loadConfigFromFile } from "./config.js";

import { promises } from "fs";
import { createFileData } from "@astral-atlas/wildspace-data";
const { mkdir } = promises;

// wildspace data init -c api/dev.config.json5

const handleInitCommand = async (extras) => {
  const options = Object.fromEntries(extras.map((e, i, a) => [e, a[i + 1]]).filter((e, i) => i % 2 === 0))
  const config = await loadConfigFromFile(options['-c'] || options['-config']);
  const dataConfig = config.data;
  if (dataConfig.type === 'file') {
    const { dirs } = createFileData(dataConfig.directory)
    for (const dir of dirs) {
      await mkdir(dir, { recursive: true });
      console.log(`Created Directory: ${dir}`)
    }
  }
};

export const handleDataCommand = (command/*: string*/, ...extras/*: string[]*/) => {
  switch (command) {
    case 'init':
      handleInitCommand(extras)
  }
}