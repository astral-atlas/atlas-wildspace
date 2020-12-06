// @flow strict
const { inspect } = require('util');
const { v4: uuid } = require('uuid');

/*::
type Context = { Provider: (value: mixed) => Node[] };
type Hooks = {
  useState: (initialValue: mixed) => [mixed, (value: mixed) => void],
  useEffect: (effectHandler: () => ?(() => void), deps?: null | mixed[]) => void,
  //useContext: (contextProvider: Context) => mixed,
};
type Props = { [string]: mixed };
type Component = (props: Props, children: Node[], hooks: Hooks) => Node[];

type Node = {
  id: string,
  type: string | Component,
  props: { [string]: mixed },
  children: Node[],
};
*/

const node = (type/*: string | Component*/, props/*: Props*/ = {}, children/*: Node[]*/ = []) => ({
  id: uuid(),
  type,
  props,
  children,
});

/*::
type Result = {
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

type NodeState = {
  usedStates: Map<number, [mixed, (value: mixed) => void, string[]]>,
  usedEffects: Map<number, {
    cleanup: ?(() => void),
    deps: null | mixed[]
  }>
};

type DirtyMark = {
  idsChain: string[],
};
*/
const createNewNodeState = ()/*: NodeState*/ => ({
  usedStates: new Map(),
  usedEffects: new Map(),
});

const setupUseState = (idsChain, { usedStates }, markDirty) => {
  let useStateCount = 0;

  const useState = (initialValue)/*: [mixed, (value: mixed) => void]*/ => {
    const stateIndex = useStateCount;
    useStateCount++;

    const cachedHook = usedStates.get(stateIndex);
    if (cachedHook) {
      const [value, setValue, oldIdChains] = cachedHook;
      // update hook to contain latest chain
      usedStates.set(stateIndex, [value, setValue, idsChain]);
      return [value, setValue];
    }

    // create new hook
    const setValue = (newValue) => {
      const prevUseStates = usedStates.get(stateIndex);
      if (!prevUseStates)
        throw new Error(`Oh no`);
      const [, setValue, idsChain] = prevUseStates;
      usedStates.set(stateIndex, [newValue, setValue, idsChain]);
      markDirty({ idsChain });
    }

    usedStates.set(stateIndex, [initialValue, setValue, idsChain]);
    return [initialValue, setValue];
  };

  return useState;
};

const depsAreEqual = (depsA, depsB) => {
  if (depsA === null || depsB === null)
    return false;
  if (depsA.length !== depsB.length)
    return false;
  return depsA.every((value, index) => value === depsB[index]);
}

const setupUseEffect = (nodeState) => {
  let useEffectCount = 0;

  const useEffect = (effect, deps = null) => {
    const effectIndex = useEffectCount;
    useEffectCount++;

    const previousEffect = nodeState.usedEffects.get(effectIndex)
    if (!previousEffect) {
      const cleanup = effect();
      nodeState.usedEffects.set(effectIndex, { cleanup, deps });
      return;
    }
    const { cleanup, deps: oldDeps } = previousEffect;
    if (depsAreEqual(deps, oldDeps))
      return;

    cleanup && cleanup();
    const newCleanup = effect();
    nodeState.usedEffects.set(effectIndex, { cleanup: newCleanup, effect, deps });
  };

  return useEffect;
};

const setupHooks = (idsChain, nodeState, markDirty)/*: Hooks*/ => {
  const useState = setupUseState(idsChain, nodeState, markDirty);
  const useEffect = setupUseEffect(nodeState);

  return {
    useState,
    useEffect,
  };
};

const getChildren = (
  node/*: Node*/,
  nodeState/*: NodeState*/,
  idsChain/*: string[]*/,
  markDirty/*: DirtyMark => void*/
) => {
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

const propsEqual = (propsA, propsB) => {
  const keysA = Object.keys(propsA);
  const keysB = Object.keys(propsB);

  if (keysA.length !== keysB.length)
    return false;

  for (let key of keysA)
    if (propsA[key] !== propsB[key])
      return false;

  return true;
}

const nodesEqual = (node/*: Node*/, lastNode/*: Node*/) => {
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

const removeHooks = (result) => {
  for (const [, { cleanup }] of result.nodeState.usedEffects)
    cleanup && cleanup();
};

const getRemovedResult = (parentIds/*: string[]*/, last/*: Result*/) => {
  const id = uuid();
  const idsChain = [...parentIds, id];

  removeHooks(last);

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
  markDirty/*: DirtyMark => void*/,
  parentIds/*: string[]*/ = [],
  last/*: ?Result*/ = null
)/*: Result*/ => {
  const id = uuid();
  const idsChain = [...parentIds, id];
  const nodeState = last ? last.nodeState : createNewNodeState();
  const childNodes = getChildren(node, nodeState, idsChain, markDirty);

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

const createNextResult = (result) => ({
  ...result,
  id: uuid(),
  persistedResults: [],
  removedResults: [],
  createdResults: [],
  updatedResults: [],
});

const renderer = (rootNode, handleEvent) => {
  let rootResult;

  const sendResultEvents = (result) => {
    for (const child of [...result.childResults, ...result.removedResults]) {
      const isRemoved = !!result.removedResults.find(removed => removed.id === child.id);
      const isUpdated = !!result.updatedResults.find(updated => updated.id === child.id);
      const isCreated = !!result.createdResults.find(created => created.id === child.id);

      if (isRemoved || isUpdated || isCreated)
        sendResultEvents(child);
      if (isRemoved)
        handleEvent({ type: 'removed', removed: child });
      if (isUpdated)
        handleEvent({ type: 'updated', updated: child });
      if (isCreated)
        handleEvent({ type: 'created', created: child });
    }
  };

  const markDirty = (dirtyMark) => {
    const dirtyIdChain = dirtyMark.idsChain;
    if (dirtyIdChain.length === 0)
      throw new Error(`idsChain too short`);
    if (dirtyIdChain.length === 1) {
      rootResult = createNewResult(rootResult.node, markDirty, [], rootResult);
      sendResultEvents(rootResult);
      return;
    }

    const parentId = dirtyIdChain[dirtyIdChain.length - 2];
    const childId = dirtyIdChain[dirtyIdChain.length - 1];

    const climb = (result, parentIds, depth) => {
      if (result.id === parentId) {
        const childIndex = result.childResults.findIndex(childResult => childResult.id === childId);
        const id = uuid();
        const idsChain = [...parentIds, id];
        const childResults = result.childResults.map((child, index) => (
          index === childIndex
          ? createNewResult(child.node, markDirty, idsChain, child)
          : child
        ));

        const nextResult = {
          ...createNextResult(result),
          id,
          parentIds,
          childResults,
          updatedResults: [childResults[childIndex]]
        }
        
        return nextResult;
      }
      if (result.id === dirtyIdChain[depth]) {
        const id = uuid();
        const idsChain = [...parentIds, id];
        const childIndex = result.childResults.findIndex(childResult => childResult.id === idsChain[depth + 1]);
        const childResults = result.childResults.map((child, index) =>
          index === childIndex
          ? climb(child, idsChain ,depth + 1)
          : child,
        );

        const nextResult = {
          ...createNextResult(result),
          id,
          parentIds,
          childResults,
          updatedResults: [childResults[childIndex]]
        };

        return nextResult;
      }
      return result;
    };
    const updatedResult = climb(rootResult, rootResult.parentIds, 0);
    rootResult = updatedResult;
    sendResultEvents(updatedResult);
  };

  rootResult = createNewResult(node('root', {}, [rootNode]), markDirty, [], null);
  sendResultEvents(rootResult);
  return rootResult;
};

/*::
type Tree = {
  type: string,
  props: { [string]: mixed },
  children: Tree[],
};
*/

const getTree = (result/*: Result*/)/*: Tree[]*/ => {
  if (typeof result.node.type === 'function')
    return result.childResults.map(getTree).flat(1);
  
  return [{
    type: result.node.type,
    id: result.id,
    props: result.node.props,
    children: result.childResults.map(getTree).flat(1),
  }];
};

const Character = ({ name }, children, { useState, useEffect }) => {
  useEffect(() => {
    const id = setInterval(() => console.log(name), 100);
    return () => clearInterval(id);
  }, null);

  return [node('group', { name: 'character', id: name }, [
    node('arm'),
    node('leg'),
  ])]
}

const App = ({ initialCharacters }, _, { useState }) => {
  const [characters, setCharacters] = useState(initialCharacters);
  console.log(characters);

  return [
    node('hook', { setCharacters }),
    node('scene', {}, [
      node('light'),
      ...characters.map((name) => node(Character, { key: name, name })),
    ])
  ];
};

const getTreeHooks = (tree) => {
  return tree
    .map(node => node.type === 'hook' ? [node.props.setCharacters] : getTreeHooks(node.children))
    .flat(1)
};

const appResult = renderer(node(App, { initialCharacters: ['luke'] }), (event) => {
  console.log(event.type, (event.updated || event.created || event.removed).node.type)
});

const tree = getTree(appResult);
const [firstHook] = getTreeHooks(tree);


setTimeout(() => {
  firstHook(['luke', 'beth', 'carlo']);
  setTimeout(() => {
    firstHook(['luke', 'carlo']);
    debugger;
  }, 500);
  
}, 500);

