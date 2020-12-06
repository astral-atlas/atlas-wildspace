// @flow strict
/*:: import type { DirtyMark } from './dirty'; */
/*:: import type { Node } from './node'; */
const { nanoid: uuid } = require('nanoid');
const { removeHooks } = require('./hooks');
const { applyNode, nodesEqual } = require('./node');

/*::
export type Result = {
  id: string,
  parentIds: string[],
  node: Node,
  childResults: Result[],

  nodeState: NodeState,
  persistedResults: Result[],
  removedResults: Result[],
  createdResults: Result[],
  updatedResults: Result[],
};

export type NodeState = {
  usedStates: Map<number, [mixed, (value: mixed) => void, string[]]>,
  usedEffects: Map<number, {
    cleanup: ?(() => void),
    deps: null | mixed[]
  }>
};
*/

const createNewNodeState = ()/*: NodeState*/ => ({
  usedStates: new Map(),
  usedEffects: new Map(),
});

const getRemovedResult = (parentIds/*: string[]*/, last/*: Result*/)/*: Result*/ => {
  const id = uuid();
  const idsChain = [...parentIds, id];

  removeHooks(last.nodeState);

  return {
    ...last,
    id,
    parentIds,
    childResults: [],

    persistedResults: [],
    removedResults: last.childResults.map(child => getRemovedResult(idsChain, child)),
    createdResults: [],
    updatedResults: [],
  }
};

const createNewResult = (
  node/*: Node*/,
  markDirty/*: (dirtyMark: DirtyMark) => void*/,
  parentIds/*: string[]*/ = [],
  last/*: ?Result*/ = null
)/*: Result*/ => {
  const id = uuid();
  const idsChain = [...parentIds, id];
  const nodeState = last ? last.nodeState : createNewNodeState();
  const childNodes = applyNode(node, nodeState, idsChain, markDirty);

  // If this is a new mount, mount all children like new
  if (!last) {
    const childResults = childNodes.map(child => getResultOrLast(child, markDirty, idsChain));
    return {
      id,
      node,
      parentIds,
      childResults,
      nodeState,

      persistedResults: [],
      removedResults: [],
      createdResults: childResults,
      updatedResults: [],
    };
  }
  // this is not a new mount: find all previous results and map them to our children
  const persistedResultIndices = findPersistedResultIndices(childNodes, last.childResults);

  const persistedResults = persistedResultIndices
    .map(resultIndex => last.childResults[resultIndex]);
  const removedResults = findRemovedResults(persistedResultIndices, last.childResults)
    .map(removedResult => getRemovedResult(idsChain, removedResult));

  const childResults = childNodes
    .map((child, index) =>
      getResultOrLast(child, markDirty, idsChain, persistedResults[index]));

  const createdResults = childResults
    .filter((_, index) => !persistedResults[index]);
  const updatedResults = childResults
    .filter((childResult, index) =>
      persistedResults[index]
      && (childResult.id !== persistedResults[index].id));

  return {
    id,
    node,
    parentIds,
    childResults,
    nodeState,
    persistedResults,
    removedResults,
    createdResults,
    updatedResults,
  };
};

const findByKey = (key, results) => {
  return results.findIndex(result => result.node.props.key === key);
}

const findByIndex = (index, results) => {
  return results[index] ? index : -1;
}

/** Finds the index of the result that corresponds to this node */
const findResultIndex = (node/*: Node*/, nodeIndex/*: number*/, results/*: Result[]*/) => {
  const resultIndex = node.props.key
    ? findByKey(node.props.key, results)
    : findByIndex(nodeIndex, results);

  if (resultIndex === -1)
    return -1;

  const result = results[resultIndex];
  if (result.node.type !== node.type)
    return -1;
  
  return resultIndex;
}

/** Maps the indices of the node to corresponding results */
const findPersistedResultIndices = (nodes/*: Node[]*/, results/*: Result[]*/)/*: number[]*/ => {
  return nodes.map((node, index) => findResultIndex(node, index, results));
};

/** Find all results that were not present in the current nodes */
const findRemovedResults = (resultIndices, results) => {
  return results.filter((_, index) => !resultIndices.includes(index));
}

const getResultOrLast = (
  node/*: Node*/,
  markDirty/*: DirtyMark => void*/,
  parentIds/*: string[]*/ = [],
  last/*: ?Result*/ = null
) => {
  if (last && nodesEqual(node, last.node)) {
    const id = uuid();
    return {
      ...last,
      id,
      idsChain: [...parentIds, id],
      persistedResults: [],
      removedResults: [],
      createdResults: [],
      updatedResults: [],
    }
  }
  return createNewResult(node, markDirty, parentIds, last);
}

const createNextResult = (result/*: Result*/)/*: Result*/ => ({
  ...result,
  id: uuid(),
  persistedResults: [],
  removedResults: [],
  createdResults: [],
  updatedResults: [],
});

module.exports = {
  createNewNodeState,
  getRemovedResult,
  createNewResult,
  createNextResult
};