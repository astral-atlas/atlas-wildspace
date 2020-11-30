// @flow strict
/*:: import type { WildspaceClient } from '@astral-atlas/wildspace-client'; */
import { h, createContext } from 'preact';
import { useContext } from 'preact/hooks';

import { createWildspaceClient,  } from '@astral-atlas/wildspace-client';
import { createWebClient } from '@lukekaalim/http-client';

const secret = 'bothways';
const user = {
  type: 'game-master',
  gameMaster: {
    name: 'Luke Kaalim',
    id: 'luke',
  },
};

const WildspaceContext = createContext/*:: <?WildspaceClient>*/();

const WildspaceProvider = ({ children }) => {
  const http = createWebClient(window.fetch);
  const client = createWildspaceClient(new URL('http://localhost:8080'), http, user, secret);
  //const client = createWildspaceClient('http://atlaswildspace-production.eba-4xfcvy37.ap-southeast-2.elasticbeanstalk.com/');
  return h(WildspaceContext.Provider, { value: client }, children);
};

const useWildspaceClient = ()/*: WildspaceClient*/ => {
  const client = useContext(WildspaceContext);
  if (!client)
    throw new Error(`No client is present in this tree`);
  return client;
}

export {
  WildspaceProvider,
  useWildspaceClient
};
