// @flow strict
import { promises } from 'fs';
import { dirname } from 'path';

import { getDataFilePaths, getDataDirectoryPaths } from "@astral-atlas/wildspace-data";

const { writeFile, mkdir, rm } = promises;

export const initFileData = async (directory/*: string*/) => {
  const files = getDataFilePaths(directory);
  const dirs = getDataDirectoryPaths(directory);

  for (const path/*: string*/ of (Object.values(files)/*: any*/)) {
    await mkdir(dirname(path), { recursive: true });
    await writeFile(path, JSON.stringify([]));
  }
  for (const path/*: string*/ of (Object.values(dirs)/*: any*/)) {
    await rm(path, { recursive: true, force: true });
    await mkdir(path, { recursive: true });
  }
};