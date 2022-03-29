// @flow strict
/*:: import type { APIConfig } from '@astral-atlas/wildspace-models'; */
import { resolve } from 'path';
import { promises } from 'fs';
import JSON5 from 'json5';
import { castAPIConfig } from '@astral-atlas/wildspace-models';

const { readFile } = promises;

export const loadConfigFromFile = async (configPath/*: string*/ = 'config.json')/*: Promise<APIConfig>*/ => {
  try {
    console.log(`Loading config from ${resolve(configPath)}`);
    const config = castAPIConfig(JSON5.parse(await readFile(configPath, 'utf-8')));
    console.log(config);
    return config;
  } catch (error) {
    console.warn('Could not load config');
    throw error;
  }
};