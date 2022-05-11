// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { UserID } from "@astral-atlas/sesame-models";
import type { GameID } from "../game";
*/
import { castUserId } from "@astral-atlas/sesame-models";
import { c } from "@lukekaalim/cast";
import { castGameId } from "../game.js";

import { Step } from 'prosemirror-transform';
import { Node } from 'prosemirror-model';
import { proseSchema } from "../prose.js";

/*::

export type WikiDocID = string;
export type WikiDoc = {
  gameId: GameID,
  id: WikiDocID,

  title: string,

  version: number,
  lastUpdatedBy: UserID,
  rootNode: mixed,
};
*/

export const castWikiDocId/*: Cast<WikiDocID>*/ = c.str;
export const castWikiDoc/*: Cast<WikiDoc>*/ = c.obj({
  gameId: castGameId,
  id: castWikiDocId,

  title: c.str,

  version: c.num,
  lastUpdatedBy: castUserId,
  rootNode: (n) => n,
});

/*::
export type WikiDocUpdate = {
  userId: UserID,
  clientId: number,

  version: number,
  steps: $ReadOnlyArray<mixed>,
};
*/

export const castWikiDocUpdate/*: Cast<WikiDocUpdate>*/ = c.obj({
  userId: castUserId,
  clientId: c.num,

  version: c.num,
  steps: c.arr(s => s),
})

export const applyWikiDocUpdate = (doc/*: WikiDoc*/, update/*: WikiDocUpdate*/)/*: WikiDoc*/ => {
  const initialNode = Node.fromJSON(proseSchema, doc.rootNode);

  if (doc.version !== update.version)
    throw new Error(`Mismatched Version (Got ${update.version}, expected ${doc.version})`);

  const nextNode = update.steps
    .map(step => Step.fromJSON(proseSchema, step))
    .reduce((node, step) => {
      const result = step.apply(node)
      if (!result.doc)
        throw new Error(result.failed);
      return result.doc;
    }, initialNode)

  return {
    ...doc,
    rootNode: nextNode.toJSON(),
    version: doc.version + update.steps.length,
  }
}