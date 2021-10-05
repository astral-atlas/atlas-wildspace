// @flow strict
/*:: import type { Context } from '@lukekaalim/act'; */
/*:: import type { WildspaceClient } from '@astral-atlas/wildspace-client2'; */
import { h, useMemo, useEffect, useState, useContext, createContext, useRef } from "@lukekaalim/act";
import { createWildspaceClient } from '@astral-atlas/wildspace-client2';

export const clientContext/*: Context<WildspaceClient>*/ = createContext(createWildspaceClient(({}/*: any*/), '127.0.0.1:5567'));

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