// @flow strict
/*::
import type { LinkProof } from "@astral-atlas/sesame-models";
import type { Store } from "../store";
*/

import { createStorageStore } from "../store.js";
import { castLinkProof } from "@astral-atlas/sesame-models";
import { c } from "@lukekaalim/cast";

/*::
type StoredIdentity = ?LinkProof
*/

export const identityProofStore/*: Store<?LinkProof>*/ = createStorageStore(
  'wildspace_identity_proof',
  c.maybe(castLinkProof),
  null,
  window.localStorage,
);
