// @flow strict
const { nanoid: uuid } = require('nanoid');
/*:: import type { StateHooks, StatePath } from './state'; */
/*:: import type { ActGraph } from './graph'; */
const { setupHooks, loadHooks } = require('./state');

/*::
export type Props = { [string]: mixed };
export type Component = (props: Props, children: Node[], hooks: StateHooks) => Node[];

export type Node = {
  id: string,
  type: string | Component,
  props: ?Props,
  children: Node[],
};
*/

const node = /*::<P: Props = {}>*/(
  type/*: string | (p: P, c: Node[], h: StateHooks) => Node[]*/,
  props/*: ?P*/,
  children/*: Node[]*/ = []
)/*: Node*/ => ({
  id: uuid(),
  // $FlowFixMe
  type,
  props,
  children,
});

const propsEqual = (propsA/*: ?Props*/, propsB/*: ?Props*/)/*: boolean*/ => {
  if (propsA === propsB)
    return true;
  if (!propsA || !propsB)
    return false; 
  const keysA = Object.keys(propsA);
  const keysB = Object.keys(propsB);

  if (keysA.length !== keysB.length)
    return false;

  for (let key of keysA)
    if (propsA[key] !== propsB[key])
      return false;

  return true;
}

/** Determine if two nodes are equivalent in props, type and children  */
const nodesEqual = (node/*: Node*/, lastNode/*: Node*/)/*: boolean*/ => {
  if (node.id === lastNode.id)
    return true;
  if (node.type !== lastNode.type)
    return false;
  if (!propsEqual(node.props, lastNode.props))
    return false;
  if (!node.children.every((child, index) =>
    lastNode.children[index] && nodesEqual(child, lastNode.children[index])))
    return false;
  return true;
};

/*::
type NodeLifecycle =
  | 'create'
  | 'update'
*/

const getHooks = (lifecycle/*: NodeLifecycle*/, graph/*: ActGraph*/, path/*: StatePath*/) => {
  switch (lifecycle) {
    case 'create':
      return setupHooks(graph, path);
    case 'update':
      return loadHooks(graph, path);
    default:
      throw new Error(`Unknown lifecycle type`);
  }
};

const renderNode = (lifecycle/*: NodeLifecycle*/, graph/*: ActGraph*/, node/*: Node*/, path/*: StatePath*/)/*: Node[]*/ => {
  const { type, children, props } = node;
  switch (typeof type) {
    case 'function':
      return type(props || {}, children, getHooks(lifecycle, graph, path));
    case 'string':
      return node.children;
    default:
      throw new Error(`Unknown component type`);
  }
};

module.exports = {
  node,
  propsEqual,
  nodesEqual,
  renderNode,
};
