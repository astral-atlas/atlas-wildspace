// @flow strict
/*::
import type { Assertion } from "@lukekaalim/test";
*/
import { createScheduleController } from "@astral-atlas/wildspace-components/controllers/index.js"
import { assert } from "@lukekaalim/test";

export const assertSchedule = ()/*: Assertion*/ => {
  const schedule = createScheduleController();

  schedule.enqueueWork(function* () {
    console.log('Starting function')
    yield;
    yield;
    yield;
    yield;
    yield;
    console.log('Finishing Function')
  }());
  schedule.enqueueWork(function* () {
    console.log('Starting second function')
    yield;
    yield;
    console.log('Finishing second Function')
  }());

  let iterations = 0
  const maxIterations = 10;
  schedule.startWork(() => {
    console.log(iterations)
    return maxIterations - (iterations++)
  })

  return assert('Schedule Works', true)
}