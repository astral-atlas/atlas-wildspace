// @flow strict
/*:: import type { WWWConfig } from '@astral-atlas/wildspace-models'; */
import { castWWWConfig } from '@astral-atlas/wildspace-models'

export const loadConfigFromURL = async (path/*: string*/ = '/config.json')/*: Promise<WWWConfig>*/ => {
  const request = await fetch(path)
  const body = await request.json();
  return castWWWConfig(body);
}