// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
*/
import { c } from "@lukekaalim/cast";

/*::
export type MagicItemID = string;
export type MagicItem = {
  id: MagicItemID,

  title: string,
  visibility: ?(
    | {| type: 'game-master-in-game' |}
    | {| type: 'players-in-game' |}
  ),
  type: string,

  rarity: string,
  requiresAttunement: boolean,

  description: string,
};
*/

export const castMagicItemId/*: Cast<MagicItemID>*/ = c.str;
export const castMagicItem/*: Cast<MagicItem>*/ = c.obj({
  id: castMagicItemId,

  title: c.str,
  visibility: c.maybe(c.or('type', {
    'game-master-in-game': c.obj({ type: c.lit('game-master-in-game') }),
    'players-in-game': c.obj({ type: c.lit('players-in-game') }),
  })),
  type: c.str,

  rarity: c.str,
  requiresAttunement: c.bool,

  description: c.str,
});
