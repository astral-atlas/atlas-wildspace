// @flow strict
/*:: import type { LinkProof } from "@astral-atlas/sesame-models"; */
/*:: import type { WWWConfig } from "@astral-atlas/wildspace-models"; */
/*:: import type { Context } from "@lukekaalim/act"; */

import { createContext, useContext } from "@lukekaalim/act";

/*::
export type WildspaceState = {
  proof: LinkProof,
  config: WWWConfig
};
*/

export const wildspaceStateContext/*: Context<null | WildspaceState>*/ = createContext(null);

export const useWildspaceState = ()/*: WildspaceState*/ => {
  const state = useContext(wildspaceStateContext);
  if (!state)
    throw new Error();
  return state;
}