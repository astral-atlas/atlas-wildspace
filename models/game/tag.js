// @flow strict
/*::
import type { GameMetaResource } from "./meta";
import type { Cast } from "@lukekaalim/cast";
import type { ProseMirrorJSONNode } from "prosemirror-model";
*/
import { castProseMirrorJSONNode } from "../prose.js";
import { castGameMetaResource } from "./meta.js";
import { c } from "@lukekaalim/cast";

/*::
export type TagID = string;
export type Tag = GameMetaResource<{
  color: string,
  description: ProseMirrorJSONNode,
}, TagID>;
*/

export const castTagId = c.str;
export const castTag/*: Cast<Tag>*/ = castGameMetaResource(castTagId, c.obj({
  color: c.str,
  description: castProseMirrorJSONNode
}));
