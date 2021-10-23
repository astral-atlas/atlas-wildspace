// @flow strict
/*:: import type { WWWConfig } from '@astral-atlas/wildspace-models'; */
import { castWWWConfig } from '@astral-atlas/wildspace-models'

export const loadConfig = async ()/*: Promise<WWWConfig>*/ => {
  const request = await fetch('/config.json')
  const body = await request.json();
  return castWWWConfig(body);
}

export const loadConfigFromURL = async ()/*: Promise<WWWConfig>*/ => {
  const request = await fetch('/config.json')
  const body = await request.json();
  return castWWWConfig(body);
}