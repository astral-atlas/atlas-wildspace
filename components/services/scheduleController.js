// @flow strict
import * as list from "../animation/list";

import { v4 as uuid } from "uuid";

/*::
export type SchedulerCancelSignaller = {
  cancel: () => void,
  addCancelListener: (onCancel: () => void) => () => void,
};

export type ScheduleService = {
  enqueueWork: (workFunction: Iterator<void>, cancelSignaller?: SchedulerCancelSignaller) => { cancel: () => void },

  startWork: (getTimeRemaining: () => number) => void,
};
*/

export const createSchedulerCancelSignaller = ()/*: SchedulerCancelSignaller*/ => {
  let cancelledListeners = new Set();
  const cancel = () => {
    for (const { onCancel } of cancelledListeners)
      onCancel();
  };
  const addCancelListener = (onCancel) => {
    const listener = { onCancel };
    cancelledListeners.add(listener);
    return () => void cancelledListeners.delete(listener);
  };
  return { cancel, addCancelListener }
}

export const createScheduleService = ()/*: ScheduleService*/ => {
  let queue = [];
  
  const enqueueWork = (workFunction, cancelSignaller) => {
    const id = uuid();
    queue.push({ id, workFunction });
    const cancel = () => {
      queue = queue.filter(el => el.id !== id);
    };
    if (cancelSignaller)
      cancelSignaller.addCancelListener(cancel)

    return { cancel };
  };

  const startWork = (getTimeRemaining) => {
    while (queue.length > 0) {
      const { workFunction } = queue[0];

      let workRemains = true;
      while (workRemains && getTimeRemaining() > 0) {
       const result = workFunction.next();
       workRemains = !result.done;
      }

      if (!workRemains) {
        queue.shift();
      }
    }
  };

  return { enqueueWork, startWork };
}