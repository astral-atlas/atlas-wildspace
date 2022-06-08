// @flow strict
/*::
import type { AssetInfo } from "@astral-atlas/wildspace-models";
*/
import { v4 as uuid } from 'uuid';
import { randomIntRange } from './random.js';
import seedrandom from 'seedrandom';

export const createMockImageAsset = (id/*: string*/ = uuid())/*: AssetInfo*/ => {
  return {
    description: {
      id,
      MIMEType: 'image/jpg',
      bytes: 0,
      creator: 'CREATOR',
      name: 'Test Image',
      uploaded: Date.now(),
    },
    downloadURL: createMockImageURL(id)
  }
};

export const createMockImageURL = (seed/*: string*/ = uuid())/*: string*/ => {
  const size = randomIntRange(400, 100, seed);
  return `http://placekitten.com/${size}/${size}`;
}