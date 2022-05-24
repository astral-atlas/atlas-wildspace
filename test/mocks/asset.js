// @flow strict
/*::
import type { AssetInfo } from "@astral-atlas/wildspace-models";
*/
import { v4 as uuid } from 'uuid';
import { randomIntRange } from './random.js';

export const createMockImageAsset = ()/*: AssetInfo*/ => {
  const size = randomIntRange(400, 100);
  return {
    description: {
      id: uuid(),
      MIMEType: 'image/jpg',
      bytes: 0,
      creator: 'CREATOR',
      name: 'Test Image',
      uploaded: Date.now(),
    },
    downloadURL: `http://placekitten.com/${size}/${size}`
  }
};