// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { JSONNode } from "prosemirror-model";
*/
import { c } from "@lukekaalim/cast";
import { proseNodeJSONSerializer, proseStepJSONSerializer, castJSONSerializedNode } from "../../prose.js";

/*::
export type RichTextVersion = number;
export type RichText = {
  rootNode: JSONNode,
  version: RichTextVersion,
};
*/
export const castRichText/*: Cast<RichText>*/ = c.obj({
  rootNode: castJSONSerializedNode,
  version: c.num,
});

/*::
export type RichTextUpdate = {
  clientId: number,
  version: RichTextVersion,
  steps: $ReadOnlyArray<mixed>,
};
*/

export const castRichTextUpdate/*: Cast<RichTextUpdate>*/ = c.obj({
  clientId: c.num,

  version: c.num,
  steps: c.arr(s => s),
})

export const applyRichTextUpdate = (richText/*: RichText*/, richTextUpdate/*: RichTextUpdate*/)/*: RichText*/ => {
  const initialNode = proseNodeJSONSerializer.deserialize(richText.rootNode);

  if (richText.version !== richTextUpdate.version)
    throw new Error(`Mismatched Version (Got ${richTextUpdate.version}, expected ${richText.version})`);

  const nextNode = richTextUpdate.steps
    .map(step => proseStepJSONSerializer.deserialize(step))
    .reduce((node, step) => {
      const result = step.apply(node)
      if (!result.doc)
        throw new Error(result.failed);
      return result.doc;
    }, initialNode)

  return {
    rootNode: nextNode.toJSON(),
    version: richText.version + richTextUpdate.steps.length,
  }
}