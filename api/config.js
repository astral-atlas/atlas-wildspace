// @flow strict
/*:: import type { APIConfig, AWSParameterStoreConfig } from '@astral-atlas/wildspace-models'; */
import { resolve } from 'path';
import { promises } from 'fs';
import { SSM } from '@aws-sdk/client-ssm';
import JSON5 from 'json5';
import { castAPIConfigChain } from '@astral-atlas/wildspace-models';

const { readFile } = promises;

export const loadConfigFromChain = async (
  configContent/*: string*/
)/*: Promise<APIConfig>*/ => {
  const config = castAPIConfigChain(JSON5.parse(configContent));
  console.log(config);
  switch (config.type) {
    default:
    case 'final':
      return config;
    case 'aws-parameter-store':
      return await loadConfigFromParameterStore(config);
  }
}

export const loadConfigFromFile = async (
  configPath/*: string*/ = 'config.json'
)/*: Promise<APIConfig>*/ => {
  try {
    console.log(`Loading config from "${resolve(configPath)}"`);
    return loadConfigFromChain(await readFile(configPath, 'utf-8'));
  } catch (error) {
    console.warn('Could not load local file config');
    throw error;
  }
};

export const loadConfigFromParameterStore = async (
  paramConfig/*: AWSParameterStoreConfig*/
)/*: Promise<APIConfig>*/ => {
  try {
    const ssm = new SSM({ region: paramConfig.region });
  
    console.log(`Loading config from AWS Parameter "${paramConfig.name}"`);
    const { Parameter } = await ssm.getParameter({ Name: paramConfig.name });
    console.log(Parameter)
    if (!Parameter || !Parameter.Value)
      throw new Error();
    return loadConfigFromChain(Parameter.Value);
  } catch (error) {
    console.warn('Could not load parameter store config');
    throw error;
  }
}


/*::
export type ConfigLoaderService = {
  dispose: () => void,
  load: () => Promise<mixed>,
  subscribeConfigLoad: (listener: (config: APIConfig) => mixed) => void,
}
*/

const createAwsParameterStoreService = () => {
  
}

export const createConfigLoaderService = (configPath/*: string*/)/*: ConfigLoaderService*/ => {

  const load = async () => {
    const config = castAPIConfigChain(JSON5.parse(await readFile(configPath, 'utf-8')));
    switch (config.type) {
      default:
      case 'final':
        return config;
      case 'aws-parameter-store':
        return await loadConfigFromParameterStore(config);
    }
  }

  const configLoadListeners = new Set();
  const subscribeConfigLoad = (listener) => {
    configLoadListeners.add(listener);
  }
  const dispose = () => {

  }

  return {
    subscribeConfigLoad,
    dispose,
    load,
  }
};