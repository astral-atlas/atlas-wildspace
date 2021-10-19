// @flow strict
/*:: import type { Connection, ConnectionDescription } from "@lukekaalim/net-description"; */
/*:: import type { LinkProof } from "@astral-atlas/sesame-models"; */
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { c, castObject } from '@lukekaalim/cast';
import { castLinkProof } from "@astral-atlas/sesame-models";

/*::
export type ProofMessage = {|
  type: 'proof',
  proof: LinkProof,
|};

export type AuthorizedConnection<T: Connection<any>> = Connection<
  T['server'],
  T['client'] | ProofMessage,
  T['query'],
>;
*/

export const castProofMessage/*: Cast<ProofMessage>*/ = c.obj({
  type: c.lit('proof'),
  proof: castLinkProof,
})

export const createAuthorizedConnectionDescription = /*:: <T: Connection<>>*/(desc/*: ConnectionDescription<T>*/)/*: ConnectionDescription<AuthorizedConnection<T>>*/ => {
  return {
    ...desc,
    castClientMessage: (value) => {
      const obj = castObject(value);
      if (obj.type === 'proof')
        return castProofMessage(value);
      if (desc.castClientMessage)
        desc.castClientMessage(value);
      throw new Error();
    }
  }
};