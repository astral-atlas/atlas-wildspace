// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { UserID } from "@astral-atlas/sesame-models";
import type { GameID } from "../game";
*/
import { castUserId } from "@astral-atlas/sesame-models";
import { c } from "@lukekaalim/cast";
import { castGameId } from "../game.js";

/*::

export type WikiDocID = string;
export type WikiDoc = {
  gameId: GameID,
  id: WikiDocID,

  title: string,

  version: number,
  rootNode: mixed,
  steps: $ReadOnlyArray<mixed>,
};
*/

export const castWikiDocId/*: Cast<WikiDocID>*/ = c.str;
export const castWikiDoc/*: Cast<WikiDoc>*/ = c.obj({
  gameId: castGameId,
  id: castWikiDocId,

  title: c.str,

  version: c.num,
  rootNode: (n) => n,
  steps: c.arr(s => s)
});

/*::
export type WikiDocUpdate = {
  docId: WikiDocID,
  gameId: GameID,
  userId: UserID,

  version: number,
  steps: $ReadOnlyArray<mixed>,
};
*/

export const castWikiDocUpdate/*: Cast<WikiDocUpdate>*/ = c.obj({
  docId: castWikiDocId,
  gameId: castGameId,
  userId: castUserId,

  version: c.num,
  steps: c.arr(s => s),
})

export const applyUpdate = (doc/*: WikiDoc*/, update/*: WikiDocUpdate*/)/*: WikiDoc*/ => {

}