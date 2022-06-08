// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { Monster, MonsterID } from "../character";
import type { AssetID } from "../asset";
*/
import { c } from "@lukekaalim/cast";
import { castMonsterId } from "../character.js";
import { castAssetID } from "../asset.js";

/*::
export type MonsterActorID = string;
export type MonsterActor = {
  id: MonsterActorID,
  monsterId: MonsterID,

  name: ?string,
  secretName: ?string,

  hitpoints: number,
  conditions: $ReadOnlyArray<string>,
};

export type MonsterActorMask = {
  id: MonsterActorID,

  name: string,
  healthDescriptionText: string,
  initiativeIconAssetId: ?AssetID,
  conditions: $ReadOnlyArray<string>
}
*/

export const createMaskForMonsterActor = (monster/*: Monster*/, actor/*: MonsterActor*/)/*: MonsterActorMask*/ => ({
  id: actor.id,

  name: actor.name || monster.name,
  healthDescriptionText: 'Healthy',
  initiativeIconAssetId: monster.initiativeIconAssetId,
  conditions: actor.conditions,
})

export const castMonsterActorId/*: Cast<MonsterActorID>*/ = c.str;
export const castMonsterActor/*: Cast<MonsterActor>*/ = c.obj({
  id: castMonsterActorId,
  monsterId: castMonsterId,

  name: c.maybe(c.str),
  secretName: c.maybe(c.str),

  hitpoints: c.num,
  conditions: c.arr(c.str)
});
export const castMonsterActorMask/*: Cast<MonsterActorMask>*/ = c.obj({
  id: castMonsterActorId,

  name: c.str,
  healthDescriptionText: c.str,
  conditions: c.arr(c.str),
  initiativeIconAssetId: c.maybe(castAssetID)
})