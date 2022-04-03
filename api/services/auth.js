// @flow strict
/*:: import type { APIConfig, SesameAPIAuthConfig, FakeAuthConfig } from '@astral-atlas/wildspace-models'; */
/*:: import type { SesameSDK } from '@astral-atlas/sesame-client'; */
/*:: import type { LinkGrant } from "@astral-atlas/sesame-models"; */
/*:: import type { WildspaceData } from '@astral-atlas/wildspace-data'; */
import { request } from 'http';
import { createSesameSDK } from "@astral-atlas/sesame-client";
import { createNodeClient } from '@lukekaalim/http-client';
import { decodeAuthorizationHeader } from "@lukekaalim/net-description";

/*::
export type Identity =
  | { type: 'guest' }
  | { type: 'link', grant: LinkGrant };

export type AuthService = {
  getAuthFromHeader: (authorizationHeader: string) => Promise<Identity>,
  sdk: SesameSDK,
};
*/

const createFakeAuthService = (config/*: FakeAuthConfig*/)/*: AuthService*/ => {
  const grant = {
    type: 'link',
    id: '0',
    identity: config.user.id,
    linkedIdentity: '',
    target: 'localhost',
    revoked: false,
  };
  const identity = {
    type: 'link',
    grant,
  }
  const getAuthFromHeader = async () => {
    return identity;
  };
  const sdk = {
    validateHeader: async () => { throw new Error() },
    validateProof: async () => { throw new Error() },
    getUser: async () => config.user,
  };
  return {
    sdk,
    getAuthFromHeader,
  }
}

const createSesameAPIAuthService = (auth/*: SesameAPIAuthConfig*/)/*: AuthService*/ => {
  const httpClient = createNodeClient(request);
  const sdk = createSesameSDK(new URL(auth.origin), httpClient, auth.proof);
  
  const getAuthFromHeader = async (authorizationHeader) => {
    if (!authorizationHeader)
      return { type: 'guest' };
    const authorization = await sdk.validateHeader(authorizationHeader);
    if (authorization.type === 'invalid')
      throw new Error();
    const { grant } = authorization;
    return { type: 'link', grant };
  };

  return {
    getAuthFromHeader,
    sdk,
  };
}

export const createAuthService = (config/*: APIConfig*/)/*: AuthService*/ => {
  switch (config.auth.type) {
    case 'fake':
      return createFakeAuthService(config.auth);
    case 'sesame':
      return createSesameAPIAuthService(config.auth);
  }
};