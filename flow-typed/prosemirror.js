// @flow strict

/*::
declare module "prosemirror-state" {
  import type { Schema } from "prosemirror-model";
  import type { EditorView } from "prosemirror-view";

  declare export class EditorState<TNodes, TMarks> {

    static create<Nodes, Marks>({ schema: Schema<any> }): EditorState<Nodes, Marks>;

    apply(...any): EditorState<any, any>;
    selection: any;
    tr: Transaction;
  }
  declare export class Plugin<T, M> {
    constructor<T>({
      state?: {
        init: () => T,
        apply: (tr: Transaction, prev: T) => T,
      },
      view?: (view: EditorView) => {
        update: (view: EditorView, prev: EditorState<any, any>) => void,
        destroy: () => void,
      },
    }): Plugin<T, M>;
    getState(state: EditorState<any, any>): T;
  }
  declare export class PluginKey<M> {
    constructor<M>(name?: string): PluginKey<M>
  }
  declare export class Transaction {
    selection: any;
    setMeta: <M>(key: Plugin<any, M> | PluginKey<M>, value: M) => void;
    getMeta: <M>(key: Plugin<any, M> | PluginKey<M>) => M;
  }
}

declare module "prosemirror-view" {
  import type { EditorState, Transaction } from "prosemirror-state";

  declare export class EditorView {
    constructor(target: Element, props?: { state: EditorState<any, any> }): EditorView;
    destroy(): void;
    hasFocus(): boolean;
    setProps(props: mixed): void;
    updateState(state: EditorState<any, any>): void;
    dispatch(state: Transaction): void;
    domAtPos(number, number): { offset: number, node: HTMLElement };
    state: EditorState<any, any>;
  }
}
declare module "prosemirror-transform" {
  import type { Schema, Node } from "prosemirror-model";
  import type { Plugin } from "prosemirror-state";

  declare export class Step {
    static fromJSON(schema: Schema<any>, input: mixed): Step;
    apply(node: Node): { doc: Node },
  }
}

declare module "prosemirror-model" {
  declare export class Node {
    static fromJSON(schema: Schema<any>, input: mixed): Node,
    toJSON(): mixed;
  }

  declare export type AttributeSpec = {
  };
  declare export type DOMOutputSpec = {
  };
  declare export type NodeSpec = {
    content?: ?string,
    marks?: ?string,
    group?: ?string,
    inline?: boolean,
    atom?: boolean,
    attrs?: { [string]: AttributeSpec },
    selectable?: boolean,
    draggable?: boolean,
    code?: boolean,
    whitespace?: 'pre' | 'normal',
    defining?: boolean,
    isolating?: string,
    toDOM?: (node: Node) => DOMOutputSpec,
    parseDOM?: mixed[],
  };
  declare export type MarkSpec = {

  }

  declare class OrderedMap<K, V> {

  }

  declare export class Schema<TNodeType: string> {
    constructor<TNodeType>({
      nodes: { [TNodeType]: NodeSpec } | OrderedMap<TNodeType, NodeSpec>,
      marks?: { [string]: MarkSpec } | OrderedMap<string, MarkSpec>,
      topNode?: string,
    }): Schema<TNodeType>;

    spec: {
      marks: OrderedMap<string, MarkSpec>,
      nodes: OrderedMap<TNodeType, NodeSpec>,
    };

    marks: { [string]: MarkSpec } | OrderedMap<string, MarkSpec>;
    nodes: { [TNodeType]: NodeSpec } | OrderedMap<TNodeType, NodeSpec>;

    node(type: string, attrs?: ?{}, content?: Node[] | Node | null): Node;
  }
}

declare module "prosemirror-schema-basic" {
  import type { Schema } from "prosemirror-model";

  declare export var schema: Schema<any>;
}
*/