// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
import type { NodeSpec, JSONNode } from "prosemirror-model";
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

export const castJSONSerializedNode/*: Cast<JSONNode>*/ = v => v;

export const proseNodeJSONSerializer = {
  serialize(node/*: Node*/)/*: JSONNode*/ {
    return node.toJSON();
  },
  deserialize(serializedNode/*: JSONNode*/)/*: Node*/ {
    try {
      return Node.fromJSON(proseSchema, serializedNode);
    } catch (error) {
      return emptyRootNode;
    }
  }
}
export const proseStepJSONSerializer = {
  serialize(step/*: Step*/)/*: JSONNode*/ {
    return step.toJSON();
  },
  deserialize(serializedStep/*: JSONNode*/)/*: Step*/ {
    return Step.fromJSON(proseSchema, serializedStep);
  }
}

