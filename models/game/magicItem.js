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
  type: c.str,

  rarity: c.str,
  requiresAttunement: c.bool,

  description: c.str,
});
