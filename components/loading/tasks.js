// @flow strict

import { useEffect, useState } from "@lukekaalim/act";

/*::
export type TaskOrder<T, R> = {
  targets: T[],
  resolve: R[] => void,
};
export type TaskCompletion<T, R> = {
  target: T,
  result: R,
}

export type TaskQueue<T, R> = {
  completed: TaskCompletion<T, R>[],
  inflights: T[],
  orders: TaskOrder<T, R>[],
  addTasks: (targets: T[]) => Promise<R[]>
};
*/

export const useTaskQueue = /*:: <T, R>*/(
  createTaskPromise/*: (target: T) => Promise<R>*/,
  maxInflightTasks/*: number*/ = 1,
)/*: TaskQueue<T, R>*/ =>  {
  const [orders, setOrders] =       useState/*:: <TaskOrder<T, R>[]>*/([]);
  const [inflights, setInflight] =  useState/*:: <T[]>*/([]);
  const [completed, setCompleted] = useState/*:: <TaskCompletion<T, R>[]>*/([]);

  const addTasks = async (targets) => {
    if (targets.length === 0)
      return [];
      
    return new Promise((resolve) => {
      const nextOrder = {
        targets,
        resolve,
      }
      setOrders(q => [...q, nextOrder]);
    });
  };

  // Takes completed orders and resolves them
  useEffect(() => {
    const orderCompletions = orders
      .map(order => [
        order,
        order
          .targets
          .map(target => completed
            .find(completion => completion.target === target))
        ])
      // type shenannigans here
      .map(([order, completions]) => completions.every(Boolean) ? [order, completions.filter(Boolean)] : null)
      .filter(Boolean)

    if (orderCompletions.length <= 0)
      return;

    for (const [order, completions] of orderCompletions) {
      order.resolve(completions.map(c => c.result));
    }

    setOrders(o => o.filter(order => !orderCompletions
      .find(([completedOrder, _]) => order === completedOrder)));
    setCompleted(c => c.filter(completed => !orderCompletions
      .find(([_, completedTargets]) => completedTargets.includes(completed))));
  }, [completed, orders])

  // Add new orders to the inflight list
  useEffect(() => {
    const newTasksCount = maxInflightTasks - inflights.length;
    if (newTasksCount <= 0)
      return;

    const newInflight = orders
      .map(order => order.targets)
      .flat(1)
      .filter(target =>
        !inflights.includes(target) &&
        !completed.find(c => c.target === target))
      .slice(0, newTasksCount)
    
    if (newInflight.length <= 0)
        return;
    
    setInflight(i => [...i, ...newInflight]);

    for (const target of newInflight) {
      createTaskPromise(target)
        .then(result => {
          setCompleted(c => [...c, { result, target }])
          setInflight(i => i.filter(inflight => inflight !== target))
        })
    }
  }, [inflights, orders, completed]);

  return {
    addTasks,
    inflights,
    orders,
    completed
  }
};