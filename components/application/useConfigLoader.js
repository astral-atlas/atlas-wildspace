// @flow strict
/*::
import type { WWWConfig } from "@astral-atlas/wildspace-models";
*/
import { useAsync } from "../utils/async";
import { loadConfigFromURL } from "./config";

export const useConfigLoader = (path/*: string*/ = '/config.json')/*: ?WWWConfig*/ => {
  const [config, configError] = useAsync(async () => loadConfigFromURL(path), [path]);
  if (configError)
    throw configError;
  
  return config;
}