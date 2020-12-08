// @flow strict
/*:: import type { ActGraph } from './graph'; */
/*:: import type { Node } from './node'; */
/*:: import type { StateID, StatePath, StateUpdate} from './state'; */
const { nanoid: uuid } = require('nanoid');
const { setupHooks, teardownHooks, loadHooks } = require('./state');
const { renderNode, nodesEqual } = require('./node');

/*::
export type CommitID = string;
export type Commit = {
  id: CommitID,
  statePath: StatePath,

  node: Node,
  childCommits: Commit[],
};
export type CommitDiff = {
  persisted: CommitDiffPair[],
  removed: CommitDiffPair[],
  created: CommitDiffPair[],
  updated: CommitDiffPair[],
};
export type CommitDiffPair = [Commit, CommitDiff];
*/

const emptyDiff/*: CommitDiff*/ = {
  persisted: [],
  removed: [],
  created: [],
  updated: [],
};

const createCommitId = ()/*: CommitID*/ => uuid();

const findByKey = (key, results) => {
  return results.findIndex(result => result.node.props && result.node.props.key === key);
}

const findByIndex = (index, results) => {
  return results[index] ? index : -1;
}

/** Finds the index of the result that corresponds to this node */
const findResultIndex = (node/*: Node*/, nodeIndex/*: number*/, commits/*: Commit[]*/) => {
  const resultIndex = node.props && node.props.key
    ? findByKey(node.props.key, commits)
    : findByIndex(nodeIndex, commits);

  if (resultIndex === -1)
    return -1;

  const result = commits[resultIndex];
  if (result.node.type !== node.type)
    return -1;
  
  return resultIndex;
}

/** Maps the indices of the node to corresponding results */
const mapPersistedIndices = (nodes/*: Node[]*/, results/*: Commit[]*/)/*: number[]*/ => {
  return nodes.map((node, index) => findResultIndex(node, index, results));
};

const createDiff = (
  graph/*: ActGraph*/,
  persistedIndices/*: number[]*/,
  childPairs/*: CommitDiffPair[]*/,
  old/*: Commit*/,
)/*: CommitDiff*/ => {
  const persisted = persistedIndices
    .map(((_, index) => persistedIndices[index] === -1 ? null : childPairs[index] ))
    .filter(Boolean);

  const removed = old.childCommits
    .map((oldCommit, index) => {
      const persistedIndex = persistedIndices[index];
      if ((persistedIndex === -1 || persistedIndex === undefined) && persistedIndex !== 0)
        return removeCommit(graph, oldCommit);
      return null;
    })
    .filter(Boolean);

  const updated = childPairs
    .map((pair, index) => {
      const previousCommit = old.childCommits[persistedIndices[index]];
      if (!previousCommit)
        return null;
      if (previousCommit.id === pair[0].id)
        return null;
      return pair;
    })
    .filter(Boolean);

  const created = childPairs
    .map((pair, index) => persistedIndices[index] !== -1 ? null : pair)
    .filter(Boolean);

  return {
    persisted,
    removed,
    updated,
    created,
  };
};

/** Use to create a commit describing the deletion of nodes from the graph */
const removeCommit = (graph/*: ActGraph*/, last/*: Commit*/)/*: [Commit, CommitDiff]*/ => {
  const id = createCommitId();

  if (typeof last.node.type === 'function')
    teardownHooks(graph, last.statePath);

  const commit = {
    ...last,
    id,
    childCommits: [],
  };
  const diff = {
    ...emptyDiff,
    removed: last.childCommits.map(child => removeCommit(graph, child)),
  };

  return [commit, diff];
};

/** Used to move a commit from one state to another */
const updateCommit = (graph/*: ActGraph*/, node/*: Node*/, last/*: Commit*/)/*: CommitDiffPair*/ => {
  const id = uuid();

  const childNodes = renderNode('update', graph, node, last.statePath);

  const persistedIndices = mapPersistedIndices(childNodes, last.childCommits);

  const childPairs = childNodes.map((child, index) => {
    const childCommit = last.childCommits[persistedIndices[index]];
    if (!childCommit)
      return createCommit(graph, child, last.statePath);
    if (!nodesEqual(child, childCommit.node))
      return updateCommit(graph, child, childCommit);
    return [childCommit, emptyDiff];
  });
  const childCommits = childPairs
    .map(pair => pair[0]);
  const commit = {
    ...last,
    id,
    node,
    childCommits,
  };
  const diff = createDiff(graph, persistedIndices, childPairs, last);
  return [commit, diff];
}

const createCommit = (graph/*: ActGraph*/, node/*: Node*/, parentPath/*: StatePath*/)/*: CommitDiffPair*/ => {
  const id = uuid();
  const stateId = uuid();
  const statePath = [...parentPath, stateId];

  const childNodes = renderNode('create', graph, node, statePath);

  const childPairs = childNodes
    .map(node => createCommit(graph, node, statePath));
  const childCommits = childPairs
    .map(pair => pair[0]);
  
  const commit = {
    id,
    statePath,
    node,
    childCommits,
  };
  const diff = {
    ...emptyDiff,
    created: childPairs,
  }
  return [commit, diff];
}

const updateCommitWithState = (graph/*: ActGraph*/, update/*: StateUpdate*/, last/*: Commit*/)/*: CommitDiffPair*/ => {
  const commitStateId = last.statePath[last.statePath.length - 1];

  // jackpot, start the normal render process
  if (update.path[update.path.length - 1] === commitStateId)
    return updateCommit(graph, last.node, last);

  // on the path: check the children and follow if needed
  if (update.path[0] === commitStateId) {
    const nextUpdate = { ...update, path: update.path.slice(1) };
    const childPairs = last.childCommits
      .map(child => {
        const childStateId = child.statePath[child.statePath.length - 1];
        if (childStateId === nextUpdate.path[0])
          return updateCommitWithState(graph, nextUpdate, child);
        return [child, emptyDiff];
      });
    const childCommits = childPairs
      .map(pair => pair[0]);
    const updated = childPairs
      .map((pair, index) => pair[0].id === last.childCommits[index].id ? null : pair)
      .filter(Boolean);
    const commit = {
      ...last,
      id: uuid(),
      childCommits,
    }
    const diff = {
      ...emptyDiff,
      updated,
    };
    return [commit, diff];
  }

  // off shot
  return [last, emptyDiff];
};

module.exports = {
  createCommitId,
  createCommit,
  updateCommit,
  removeCommit,
  updateCommitWithState,
};