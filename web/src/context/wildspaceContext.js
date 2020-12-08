// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { WildspaceClient } from '@astral-atlas/wildspace-client'; */
import { h, createContext } from 'preact';
import { useContext, useEffect, useMemo } from 'preact/hooks';

import { createGMAuthorization, createGuestAuthorization, createPlayerAuthorization, createWildspaceClient,  } from '@astral-atlas/wildspace-client';
import { createWebClient } from '@lukekaalim/http-client';
import { useStore } from './appContext';
import { useAsync } from '../hooks/useAsync';

const secret = 'bothways';
const user = {
  type: 'game-master',
  gameMaster: {
    name: 'Luke Kaalim',
    id: 'luke',
  },
};

const WildspaceContext = createContext/*:: <?WildspaceClient>*/();

const getAuth = (creds) => {
  if (!creds)
    return null;
  switch (creds.type) {
    case 'player':
      return { secret: creds.secret, user: { type: 'player', playerId: creds.id }}
    case 'game-master':
      return { secret: creds.secret, user: { type: 'game-master', gameMasterId: creds.id }}
  }
}

/*::
type ProviderProps = {
  children: Node,
}
*/

const http = createWebClient(window.fetch);

const WildspaceProvider = ({ children }/*: ProviderProps*/)/*: Node*/ => {
  const [state, dispatch] = useStore();
  const auth = useMemo(() => getAuth(state.user.credentials), [state.user.credentials]);
  const client = useMemo(() => createWildspaceClient(new URL('http://localhost:8080'), http, auth), [
    http,
    auth
  ]);
  useAsync(async () => {
    dispatch({ type: 'update-self', self: await client.user.getSelf() })
  }, [state.user.credentials]);
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
