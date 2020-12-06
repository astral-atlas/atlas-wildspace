// @flow strict
const { v4: uuid } = require('uuid');
/*:: import type { NodeState } from './result'; */
/*:: import type { DirtyMark } from './dirty'; */
/*:: import type { Hooks } from './hooks'; */
const { setupHooks } = require('./hooks');

/*::
export type Props = { [string]: mixed };
export type Component = (props: Props, children: Node[], hooks: Hooks) => Node[];

export type Node = {
  id: string,
  type: string | Component,
  props: { [string]: mixed },
  children: Node[],
};
*/

const node = (
  type/*: string | Component*/,
  props/*: Props*/ = {},
  children/*: Node[]*/ = []
)/*: Node*/ => ({
  id: uuid(),
  type,
  props,
  children,
});

const propsEqual = (propsA/*: Props*/, propsB/*: Props*/)/*: boolean*/ => {
  const keysA = Object.keys(propsA);
  const keysB = Object.keys(propsB);

  if (keysA.length !== keysB.length)
    return false;

  for (let key of keysA)
    if (propsA[key] !== propsB[key])
      return false;

  return true;
}

const nodesEqual = (node/*: Node*/, lastNode/*: Node*/)/*: boolean*/ => {
  if (node.id === lastNode.id)
    return true;
  if (node.type !== lastNode.type)
    return false;
  if (!propsEqual(node.props, lastNode.props))
    return false;
  if (!node.children.every((child, index) => lastNode.children[index] && nodesEqual(child, lastNode.children[index])))
    return false;
  return true;
};

const applyNode = (
  node/*: Node*/,
  nodeState/*: NodeState*/,
  idsChain/*: string[]*/,
  markDirty/*: DirtyMark => void*/
)/*: Node[]*/ => {
  const { type, children, props } = node;
  switch (typeof type) {
    case 'function': {
      const hooks = setupHooks(idsChain, nodeState, markDirty);
      const resultNodes = type(props, children, hooks);
      return resultNodes;
    }
    case 'string':
      return node.children;
    default:
      throw new Error(`Unknown component type`);
  }
};

module.exports = {
  node,
  n: node,
  propsEqual,
  nodesEqual,
  applyNode,
};
