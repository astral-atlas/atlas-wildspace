// @flow strict
/*:: import type { Context } from '@lukekaalim/act'; */
/*:: import type { WildspaceClient } from '@astral-atlas/wildspace-client2'; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';

export const clientContext/*: Context<WildspaceClient>*/ = createContext(createWildspaceClient(({}/*: any*/), '127.0.0.1:5567'));