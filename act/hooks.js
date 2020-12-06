// @flow strict
/*:: import type { NodeState } from './result'; */
/*:: import type { DirtyMark } from './dirty'; */

/*::
export type Context = { Provider: (value: mixed) => Node[] };
export type Hooks = {
  useState: (initialValue: mixed) => [mixed, (value: mixed) => void],
  useEffect: (effectHandler: () => ?(() => void), deps?: null | mixed[]) => void,
  //useContext: (contextProvider: Context) => mixed,
};
*/

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

const setupHooks = (
  idsChain/*: string[]*/,
  nodeState/*: NodeState*/,
  mark/*: (dirtyMark: DirtyMark) => void*/
)/*: Hooks*/ => {
  const useState = setupUseState(idsChain, nodeState, mark);
  const useEffect = setupUseEffect(nodeState);

  return {
    useState,
    useEffect,
  };
};

const removeHooks = (nodeState/*: NodeState*/) => {
  for (const [, { cleanup }] of nodeState.usedEffects)
    cleanup && cleanup();
};

module.exports = {
  setupHooks,
  removeHooks,
};
