// @flow strict
/*::
import type { Tag, TagID } from "../../game/tag";
import type { GameResource } from "./meta/gameResource";
import type { ProseMirrorJSONNode } from "prosemirror-model";
*/
import { c } from "@lukekaalim/cast";
import { castTag } from "../../game/tag.js";
import { castProseMirrorJSONStep } from "../../prose.js";

/*::
export type TagResource = {
  resource: Tag,
  input: {|
    color: string,
    description: ProseMirrorJSONNode,
  |}
}

export type TagAPI = {|
  '/games/tags': TagResource,
|}
*/

export const tagResourceSpec/*: GameResource<TagResource>["asGameResourceSpec"]*/ = {
  path: '/games/tags',
  castResource: castTag,
  castInput: c.obj({
    color: c.str,
    description: castProseMirrorJSONStep,
  }),
}

export const tagsResourceSpecs = {
  '/games/tags': tagResourceSpec,
};
