// @flow strict
/*:: import type { Result } from './result'; */
/*:: import type { Node } from './node'; */
const { nanoid: uuid } = require('nanoid');

const { createNewResult, createNextResult } = require('./result');
const { node } = require('./node');

/*::
export type DirtyMark = {
  idsChain: string[],
};

export type Event =
  | { type: 'removed', removed: Result }
  | { type: 'updated', updated: Result }
  | { type: 'created', created: Result }
*/

const renderer = (rootNode/*: Node*/, handleEvent/*: (event: Event) => void*/)/*: Result*/ => {
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

module.exports = {
  renderer,
};