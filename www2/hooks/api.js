// @flow strict
/*:: import type { Context, Component } from '@lukekaalim/act'; */
/*:: import type { WildspaceClient } from '@astral-atlas/wildspace-client2'; */
import { h, useContext, createContext } from "@lukekaalim/act";

export const apiContext/*: Context<?WildspaceClient>*/ = createContext(null);

export const APIProvider/*: Component<{ client: WildspaceClient }>*/ = ({ client, children }) => {
  return h(apiContext.Provider, { value: client }, children)
};
export const useAPI = ()/*: WildspaceClient*/ => {
  const client = useContext(apiContext);
  if (!client)
    throw new Error();
  return client;
};
