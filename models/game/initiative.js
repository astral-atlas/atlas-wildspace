// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { CharacterID } from "../character";
import type { MonsterActorID } from "../monster";
*/

import { c } from "@lukekaalim/cast";
import { castMonsterActorId } from "../monster.js";
import { castCharacterId } from "../character.js";

/*::
export type InitativeID = string;
export type Initiative = {
  id: InitativeID,
  name: string,

  turns: $ReadOnlyArray<InitiativeSlot>,

  turn: number,
  round: number,
};

export type InitiativeSlot =
  | { type: 'monster', value: number, monsterActorId: MonsterActorID, visible: boolean }
  | { type: 'character', value: number, characterId: CharacterID }
*/

export const castInitiativeSlot/*: Cast<InitiativeSlot>*/ = c.or('type', {
  'monster': c.obj({ type: c.lit('monster'), value: c.num, monsterActorId: castMonsterActorId, visible: c.bool }),
  'character': c.obj({ type: c.lit('character'), value: c.num, characterId: castCharacterId }),
})

export const castInitiativeId/*: Cast<InitativeID>*/ = c.str;
export const castInitiative/*: Cast<Initiative>*/ = c.obj({
  id: castInitiativeId,
  name: c.str,

  turns: c.arr(castInitiativeSlot),
  turn: c.num,
  round: c.num
});

