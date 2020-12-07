// @flow strict
/*:: import type { Commit, CommitDiff } from './commit'; */
/*:: import type { Node } from './node'; */
/*:: import type { StateID, CommitState, StateUpdate } from './state'; */
const { nanoid: uuid } = require('nanoid');

const { updateCommit, createCommit, updateCommitWithState } = require('./commit');
const { node } = require('./node');

/*::
export type RequestFrame = (frame: () => mixed) => mixed;

export type ActGraph = {
  states: Map<StateID, CommitState>,
  update: (state: StateUpdate) => void,
  listen: (listener: (events: CommitEvent[]) => mixed) => { closeListener: () => void }; 
};

export type CommitEvent =
  | { type: 'removed', commit: Commit, diff: CommitDiff }
  | { type: 'updated', commit: Commit, diff: CommitDiff }
  | { type: 'created', commit: Commit, diff: CommitDiff }
*/

const getEventsForDiff = (diff/*: CommitDiff*/)/*: CommitEvent[]*/ => {
  const createdEvents = diff.created.map(([commit, diff]) => [
    ...getEventsForDiff(diff),
    { type: 'created', commit, diff },
  ]).flat(1);
  const updatedEvents = diff.updated.map(([commit, diff]) => [
    ...getEventsForDiff(diff),
    { type: 'updated', commit, diff },
  ]).flat(1);
  const removedEvents = diff.removed.map(([commit, diff]) => [
    ...getEventsForDiff(diff),
    { type: 'removed', commit, diff },
  ]).flat(1);

  return [
    ...createdEvents,
    ...updatedEvents,
    ...removedEvents,
  ];
};

const createGraph = (rootNode/*: Node*/, rf/*: RequestFrame*/)/*: ActGraph*/ => {
  let listeners = [];

  const states = new Map();
  const queuedUpdates = [];

  const update = (stateUpdate) => {
    queuedUpdates.push(stateUpdate);
    if (queuedUpdates.length === 1)
      rf(processUpdates);
  };
  const processUpdates = () => {
    debugger;
    const events = [];
    while (queuedUpdates.length > 0) {
      const update = queuedUpdates.shift();
      states.set(update.path[update.path.length - 1], update.newState);
      [commit, diff] = updateCommitWithState(graph, update, commit);
      events.push(...getEventsForDiff(diff));
    }
    for (const listener of listeners)
      listener(events);
  };

  const listen = (listener) => {
    listeners.push(listener);
    listener(getEventsForDiff(diff));
    return { closeListener: () => {
      listeners = listeners.filter(l => l !== listener);
    } }
  };
  const graph = {
    states,
    update,
    listen
  };
  let [commit, diff] = createCommit(graph, node('graph', {}, [rootNode]), []);
  return graph;
};

module.exports = {
  createGraph,
};