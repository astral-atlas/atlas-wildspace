// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { UserID } from "@astral-atlas/sesame-models";
import type { ProseMirrorJSONNode } from "prosemirror-model";
import type { ProseMirrorJSONStep } from "prosemirror-transform";

import type { GameID } from "../game";
import type { GameMetaResource, Version } from "../meta";
import type { RichText } from "./richText";
*/
import { c } from "@lukekaalim/cast";
import { createTypedUnionCastList } from "../../castTypedUnion.js";
import { castGameMetaResource, castVersion } from "../meta.js";
import { castRichText } from "./richText.js";
import { castProseMirrorJSONStep, castProseMirrorJSONNode } from "../../prose.js";

/*::
export type WikiDocHistoryNode =
  | { type: 'step', step: ProseMirrorJSONStep, version: Version }
  | { type: 'doc', doc: ProseMirrorJSONNode, version: Version }


export type WikiDocID = string;
export type WikiDoc = GameMetaResource<{|
  content: ProseMirrorJSONNode,
  history: $ReadOnlyArray<WikiDocHistoryNode>,
|}, WikiDocID>;
*/
export const castWikiDocHistoryNode/*: Cast<WikiDocHistoryNode>*/ = createTypedUnionCastList([
  ['step', c.obj({ type: c.lit('step'), step: castProseMirrorJSONStep, version: castVersion })],
  ['doc', c.obj({ type: c.lit('doc'), doc: castProseMirrorJSONNode, version: castVersion })],
])

export const castWikiDocId/*: Cast<WikiDocID>*/ = c.str;
export const castWikiDoc/*: Cast<WikiDoc>*/ = castGameMetaResource(castWikiDocId, c.obj({
  content: castProseMirrorJSONNode,
  history: c.arr(castWikiDocHistoryNode),
}));
