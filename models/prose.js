// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { NodeSpec, ProseMirrorJSONNode } from "prosemirror-model";
import type { ProseMirrorJSONStep } from "prosemirror-transform";
*/

import { Node, Schema } from "prosemirror-model";
import { Step } from "prosemirror-transform";
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';


export const userCommentNodeSpec/*: NodeSpec*/ = {
  content: 'block',
  attr: {
    userId: { default: null },
  }
}
export const gameResourceNodeSpec/*: NodeSpec*/ = {
  content: '',
  attr: {
    gameRef: { default: null },
  }
}

export const proseSchema/*: Schema<any>*/ = new Schema({
  nodes: addListNodes(
    schema.spec.nodes.append({
      'game-resource': gameResourceNodeSpec,
      'user-comment': userCommentNodeSpec,
    }),
    "paragraph block*",
    "block"
  ),
  marks: schema.spec.marks
});

export const emptyRootNode/*: Node*/ = proseSchema.node("doc", null, [
  proseSchema.node("paragraph")
]);

export const castProseMirrorJSONNode/*: Cast<ProseMirrorJSONNode>*/ = v => v;
export const castProseMirrorJSONStep/*: Cast<ProseMirrorJSONStep>*/ = v => v;

export const proseNodeJSONSerializer = {
  serialize(node/*: Node*/)/*: ProseMirrorJSONNode*/ {
    return node.toJSON();
  },
  deserialize(serializedNode/*: ProseMirrorJSONNode*/)/*: Node*/ {
    try {
      return Node.fromJSON(proseSchema, serializedNode);
    } catch (error) {
      return emptyRootNode;
    }
  }
}
export const proseStepJSONSerializer = {
  serialize(step/*: Step*/)/*: ProseMirrorJSONNode*/ {
    return step.toJSON();
  },
  deserialize(serializedStep/*: ProseMirrorJSONNode*/)/*: Step*/ {
    return Step.fromJSON(proseSchema, serializedStep);
  }
}

