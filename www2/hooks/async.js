// @flow strict
/*:: import type { Context } from '@lukekaalim/act'; */
/*:: import type { WildspaceClient } from '@astral-atlas/wildspace-client2'; */
import { useEffect, useState } from "@lukekaalim/act";

export const useAsync = /*:: <T>*/(func/*: () => Promise<T>*/, memo/*: mixed[]*/)/*: [?T, ?Error]*/ => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        setData(await func());
      } catch (error) {
        setError(error);
      }
    })()
  }, memo)

  return [data, error];
};