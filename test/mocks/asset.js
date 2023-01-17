// @flow strict
/*::
import type { AssetInfo } from "@astral-atlas/wildspace-models";
*/
import { v4 as uuid } from 'uuid';
import { randomIntRange } from './random.js';
import seedrandom from 'seedrandom';

export const createMockImageAsset = (id/*: ?string*/ = null)/*: AssetInfo*/ => {
  const randomId = uuid();
  return {
    description: {
      id: id || randomId,
      MIMEType: 'image/jpg',
      bytes: 0,
      creator: 'CREATOR',
      name: 'Test Image',
      uploaded: Date.now(),
    },
    downloadURL: createMockImageURL(id || randomId)
  }
};

export const createMockImageURL = (seed/*: ?string*/ = null)/*: string*/ => {
  const size = randomIntRange(400, 100, seed || null);
  return `http://placekitten.com/${size}/${size}`;
}
