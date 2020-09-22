import { h, createContext } from 'preact';
import { useContext } from 'preact/hooks';

import { createWildspaceClient } from '@astral-atlas/wildspace-client';

const WildspaceContext = createContext();

const WildspaceProvider = ({ children }) => {
  //const client = createWildspaceClient('http://localhost:8080');
  const client = createWildspaceClient('http://atlaswildspace-production.eba-4xfcvy37.ap-southeast-2.elasticbeanstalk.com/');
  return h(WildspaceContext.Provider, { value: client }, children);
};

const useWildspaceClient = () => {
  const client = useContext(WildspaceContext);
  return client;
}

export {
  WildspaceProvider,
  useWildspaceClient
};
