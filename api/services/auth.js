// @flow strict
/*:: import type { APIConfig } from '@astral-atlas/wildspace-models'; */
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

export const createAuthService = (config/*: APIConfig*/)/*: AuthService*/ => {
  const httpClient = createNodeClient(request);
  const sdk = createSesameSDK(new URL(config.api.sesame.origin), httpClient, config.api.sesame.proof);
  
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
};