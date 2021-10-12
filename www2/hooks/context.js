// @flow strict
/*:: import type { Context, Component } from '@lukekaalim/act'; */
/*:: import type { SesameClient } from '@astral-atlas/sesame-client'; */
/*:: import type { WildspaceClient } from '@astral-atlas/wildspace-client2'; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';
import { createClient as createSesameClient } from '@astral-atlas/sesame-client';
import { createWebClient } from '@lukekaalim/http-client'

export const clientContext/*: Context<WildspaceClient>*/ = createContext(createWildspaceClient(({}/*: any*/), '127.0.0.1:5567'));

export const sesameContext/*: Context<SesameClient>*/ = createContext(createSesameClient(
  new URL('http://api.sesame.astral-atlas.com'),
  createWebClient(fetch),
  null
));