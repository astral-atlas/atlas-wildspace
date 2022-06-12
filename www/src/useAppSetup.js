// @flow strict
/*::
import type { LinkProof } from "@astral-atlas/sesame-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { WWWConfig } from "@astral-atlas/wildspace-models";
*/

import { createWildspaceClient } from "@astral-atlas/wildspace-client2";
import { useEffect, useState } from "@lukekaalim/act"
import { loadConfigFromURL } from "../config";
import { identityStore } from "../lib/storage";

/*::
export type AppSetup = {
  config: WWWConfig,
  client: WildspaceClient,
  proof: ?LinkProof
};
*/

export const useAppSetup = ()/*: ?AppSetup*/ => {
  const [appSetup, setAppSetup] = useState/*:: <?AppSetup>*/(null);

  useEffect(() => {
    const load = async () => {
      const config = await loadConfigFromURL();

      const identity = identityStore.get();
      const proof = identity && identity.proof;

      const { api: { wildspace: { httpOrigin, wsOrigin } }} = config;
      const client = createWildspaceClient(proof, httpOrigin, wsOrigin);

      const setup = {
        client,
        config,
        proof,
      }
      setAppSetup(setup)
    };

    load();
  }, [])

  return appSetup;
}