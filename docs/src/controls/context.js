// @flow strict
/*:: import type { Context } from "@lukekaalim/act"; */
import { createContext } from "@lukekaalim/act";

export const intervalContext/*: Context<[number, number => void]>*/ =
  createContext([100, _ => { throw new Error() }]);
