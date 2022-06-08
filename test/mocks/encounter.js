// @flow strict
/*::
import type { MonsterMini } from "@astral-atlas/wildspace-models";
*/
import { v4 as uuid } from 'uuid';

export const createMockMonsterMini = ()/*: MonsterMini*/ => ({
  id: uuid(),
  conditions: [],
  hitpoints: 100,
  iconAssetId: uuid(),
  maxHitpoints: 100,
  monsterId: uuid(),
  name: 'MONSTER NAME',
  position: { x: 0, y: 0, z: 0},
  tempHitpoints: 0,
  type: 'monster',
  visible: true
})