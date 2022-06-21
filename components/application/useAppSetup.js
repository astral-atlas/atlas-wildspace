// @flow strict
/*::
import type { LinkProof } from "@astral-atlas/sesame-models";
import type { WWWConfig } from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
*/
/*::
export type AppSetup = {
  proof: ?LinkProof,
  setProof: ?LinkProof => void,
  config: WWWConfig,
  client: WildspaceClient,
};
*/

import { createWildspaceClient } from "@astral-atlas/wildspace-client2";
import { useMemo } from "@lukekaalim/act"
import { identityProofStore, useStore } from "../storage"
import { useConfigLoader } from "./useConfigLoader";

const getProof = (identityConfig, storedProof) => {
  if (identityConfig.type === 'store')
    return storedProof;
  return identityConfig.proof;
}

export const useAppSetup = ()/*: ?AppSetup*/ => {
  const [storedProof, setProof] = useStore(identityProofStore);
  const config = useConfigLoader();

  return useMemo(() => {
    if (!config)
      return null;

    const { api: { wildspace }, identity } = config;
    const proof = getProof(identity || { type: 'store'}, storedProof);
    const client = createWildspaceClient(proof, wildspace.httpOrigin, wildspace.wsOrigin);

    return {
      config,
      proof,
      setProof,
      client,
    }
  }, [config, storedProof]);
}