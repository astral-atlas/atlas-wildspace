// @flow strict
import { useEffect, useState } from 'preact/hooks';

const useAsync = /*::<T>*/(getData/*: () => Promise<T>*/, deps/*: mixed[]*/)/*: [?T, ?Error]*/ => {
  const [state, setState] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => void (async () => {
    try {
      setState(await getData());
      setError(null);
    } catch (thrownError) {
      setState(null);
      setError(thrownError);
    }
  })(), deps);

  return [state, error];
};

export {
  useAsync,
};