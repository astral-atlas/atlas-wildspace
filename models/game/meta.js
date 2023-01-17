// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { TagID } from "./tag";
import type { GameID } from "./game";
import type { GamePermission } from "./permission";
*/

import { c } from "@lukekaalim/cast"
import { castGameId } from "./game.js";
import { castGamePermission } from "./permission.js";
import { v4 } from "uuid";

/*::
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date#the_ecmascript_epoch_and_timestamps
export type EpochDate = number;
export type Version = string;

export type GameMeta<ID> = {|
  id: ID,
  gameId: GameID,

  title: string,
  visibility: GamePermission,
  version: Version,

  tags: $ReadOnlyArray<TagID>,
|};

export type GameMetaResource<R, ID> = {
  ...R,
  ...GameMeta<ID>,
};
*/

export const castVersion/*: Cast<Version>*/ = c.str;
export const castGameMetaResource = /*:: <R, ID>*/(
  resourceIdCast/*: Cast<ID>*/,
  resourceCast/*: Cast<R>*/,
)/*: Cast<GameMetaResource<R, ID>>*/ => {
  const castMeta = c.obj({
    id: resourceIdCast,
    gameId: castGameId,

    title: c.str,
    visibility: castGamePermission,
    version: castVersion,

    tags: c.arr(c.str),
  })

  const cast = (value)/*: GameMetaResource<R, ID>*/ => {
    const meta = castMeta(value);
    const resource = resourceCast(value);
    return {
      ...resource,
      ...meta,
    };
  };
  return cast;
}
