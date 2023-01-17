// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { ProseMirrorJSONNode } from "prosemirror-model";
*/
import { castProseMirrorJSONNode } from "../prose.js";
import { c } from "@lukekaalim/cast";

/*::
export type MagicItemID = string;
type MagicItemVisability = 
  | {| type: 'game-master-in-game' |}
  | {| type: 'players-in-game' |}
export type MagicItem = {|
  id: MagicItemID,

  title: string,
  visibility: ?MagicItemVisability,
  type: string,

  rarity: string,
  requiresAttunement: boolean,

  description: ProseMirrorJSONNode,
|};
*/
export const castMagicItemVisability/*: Cast<MagicItemVisability>*/ = c.or('type', {
  'game-master-in-game': c.obj({ type: (c.lit('game-master-in-game')/*: Cast<'game-master-in-game'>*/) }),
  'players-in-game': c.obj({ type: (c.lit('players-in-game')/*: Cast<'players-in-game'>*/) }),
})

export const castMagicItemId/*: Cast<MagicItemID>*/ = c.str;
export const castMagicItem/*: Cast<MagicItem>*/ = c.obj({
  id: castMagicItemId,

  title: c.str,
  visibility: c.maybe(castMagicItemVisability),
  type: c.str,

  rarity: c.str,
  requiresAttunement: c.bool,

  description: castProseMirrorJSONNode,
});
