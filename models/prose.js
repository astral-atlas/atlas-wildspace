// @flow strict
import { Node, Schema } from "prosemirror-model";
import { schema } from 'prosemirror-schema-basic';
import { addListNodes } from 'prosemirror-schema-list';

export const proseSchema/*: Schema<any>*/ = new Schema({
  nodes: addListNodes(schema.spec.nodes, "paragraph block*", "block"),
  marks: schema.spec.marks
});

export const emptyRootNode/*: Node*/ = proseSchema.node("doc", null, [
  proseSchema.node("paragraph")
]);