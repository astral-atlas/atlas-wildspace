// @flow strict
import { castAPIConfig } from '@astral-atlas/wildspace-models';
import { createData } from '@astral-atlas/wildspace-data';
import JSON5 from 'json5';
import { promises } from 'fs';
const { readFile } = promises;

const readConfig = async (path = 'config.json5') => {
  return castAPIConfig(JSON5.parse(await readFile(path, 'utf-8')))
};
const getData = () => {
}

const getParams = (parameterEntryList)/*: any*/ => {
  const params = {};
  for (let i = 0; i < parameterEntryList.length; i++)
    params[parameterEntryList[i]] = parameterEntryList[i+1]
  return params;
};

const listCharacterData = async (params) => {
  const config = await readConfig(params['-c'])
  const { data } = createData(config);

  const { result: characters } = await data.characters.scan({ partition: null, sort: null }, null);
  console.log(characters.map(c => c));
};

export const handleCharacterCommand = async (action/*: string*/, ...subcommands/*: string[]*/)/*: Promise<void>*/ => {
  switch(action) {
    case 'list':
      return await listCharacterData(getParams(subcommands))
    default:
      return console.log('No idea, boss (character)');
  }
};
