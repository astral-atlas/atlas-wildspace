// @flow strict
/*:: import type { ActGraph } from './graph'; */
/*:: import type { UseEffect } from './state/useEffect'; */
/*:: import type { UseState } from './state/useState'; */
/*:: export type * from './state/useEffect'; */
/*:: export type * from './state/useState'; */
const { nanoid: uuid } = require('nanoid');

const { setupUseState, loadUseState, teardownUseState } = require('./state/useState');
const { setupUseEffect, loadUseEffect, teardownUseEffect } = require('./state/useEffect');

/*::
export type StateID = string;
export type StatePath = StateID[]

export type StateHooks = {
  useState: UseState,
  useEffect: UseEffect,
};

export type CommitState = {
  usedStates: Map<number, {
    value: mixed,
    updater: (value: mixed) => void,
  }>,
  usedEffects: Map<number, {
    cleanup: ?(() => void),
    deps: null | mixed[]
  }>
};

export type StateUpdate = {
  path: StatePath,
  newState: CommitState,
};
*/
const createStateId = ()/*: StateID*/ => uuid();

const setupHooks = (graph/*: ActGraph*/, path/*: StatePath*/)/*: StateHooks*/ => {
  const state = {
    usedStates: new Map(),
    usedEffects: new Map(),
  };
  graph.states.set(path[path.length - 1], state);

  const useState = setupUseState(graph, path, state);
  const useEffect = setupUseEffect(graph, path, state);

  return {
    useState,
    useEffect,
  };
};

const loadHooks = (graph/*: ActGraph*/, path/*: StatePath*/)/*: StateHooks*/ => {
  const state = graph.states.get(path[path.length - 1]);
  if (!state)
    throw new Error(`Attempting to Load hook that was not setup`);

  const useState = loadUseState(graph, path, state);
  const useEffect = loadUseEffect(graph, path, state);

  return {
    useState,
    useEffect,
  };
};

const teardownHooks = (graph/*: ActGraph*/, path/*: StatePath*/) => {
  const state = graph.states.get(path[path.length - 1]);
  if (!state)
    throw new Error(`Attempting to Teardown hook that was not setup`);

  teardownUseState(graph, path, state);
  teardownUseEffect(graph, path, state);

  graph.states.delete(path[path.length - 1]);
};

module.exports = {
  ...require('./state/useState'),
  ...require('./state/useEffect'),
  setupHooks,
  loadHooks,
  teardownHooks,
  createStateId,
};
