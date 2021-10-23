// @flow strict
/*:: import type { Component, SetValue, Context } from '@lukekaalim/act'; */
/*:: import type { LinkProof } from '@astral-atlas/sesame-models'; */
/*:: import type { ConsumerMessenger } from '@astral-atlas/sesame-components'; */
import { createContext, h, useContext } from '@lukekaalim/act';
import { useConsumerMessenger } from '@astral-atlas/sesame-components';
import { useStoredValue } from './storage.js';
import { identityStore } from '../lib/storage';

/*::
export type IdentityContext = {
  identity: ?{ proof: LinkProof },
  setIdentity: ?SetValue<?{ proof: LinkProof }>,
  messenger: ?ConsumerMessenger,
};
*/

export const identityContext/*: Context<IdentityContext>*/ = createContext({ identity: null, messenger: null, setIdentity: null });

export const useIdentity = ()/*: [?{ proof: LinkProof }, SetValue<?{ proof: LinkProof }>]*/ => {
  const { identity, setIdentity } = useContext(identityContext);
  if (!setIdentity)
    throw new Error();

  return [identity, setIdentity];
}

export const useMessenger = ()/*: null | ConsumerMessenger*/ => {
  const { messenger } = useContext(identityContext);
  if (!messenger)
    throw new Error();
  return messenger;
}


export const IdentityProvider/*: Component<{}>*/ = ({ children }) => {
  const [identity, setIdentity] = useStoredValue(identityStore);

  const onGrant = ({ proof }) => {
    setIdentity(v => ({ proof }));
  };
  const onReject = (e) => {
    setIdentity(v => null);
    console.warn(e)
  }

  const messenger = useConsumerMessenger('http://sesame.astral-atlas.com', {
    proof: identity && identity.proof,
    onGrant,
    onReject
  });

  return h(identityContext.Provider, { value: { identity, messenger, setIdentity } }, children)
};