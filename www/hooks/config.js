// @flow strict

import { createContext } from "@lukekaalim/act";

/*::
import type { Context } from '@lukekaalim/act';
import type { WWWConfig } from '@astral-atlas/wildspace-models';
*/

export const configContext/*: Context<?WWWConfig>*/ = createContext(null);
