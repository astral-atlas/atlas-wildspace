// @flow strict
/*:: import type { Context } from '@lukekaalim/act'; */
/*:: import type { WildspaceClient } from '@astral-atlas/wildspace-client2'; */
import { useEffect, useState } from "@lukekaalim/act";

export const useAsync = /*:: <T>*/(func/*: () => Promise<T>*/, memo/*: mixed[]*/)/*: [?T, ?Error]*/ => {
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    func()
      .then(setData)
      .catch(setError)
  }, memo)

  return [data, error];
};