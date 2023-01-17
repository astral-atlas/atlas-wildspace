// @flow strict

import { assert, colorReporter } from "@lukekaalim/test";
import { assertBoard } from "./tests/board.test.js";
import { assertSchedule } from "./tests/schedule.test.js";

const main = () => {
  console.log(colorReporter(assert('@astral-atlas/wildspace', [
    assertBoard(),
    assertSchedule(),
  ])))
};

main();