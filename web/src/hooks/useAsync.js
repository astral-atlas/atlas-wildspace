// @flow strict
/*:: import type { Connection } from '@astral-atlas/wildspace-client'; */
import { useEffect, useReducer, useState } from 'preact/hooks';

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

const useConnection = /*::<ServerEvent, ClientEvent, T>*/(
  connector/*: ?Connection<ServerEvent, ClientEvent>*/,
  reducer/*: (state: T, event: ServerEvent) => T*/,
  initialValue/*: T*/,
  deps/*: mixed[]*/
)/*: [T, ClientEvent => void]*/ => {
  const [value, dispatch] = useReducer(reducer, initialValue);

  useEffect(() => {
    if (!connector)
      return;
    const onEvent = (event/*: ServerEvent*/) => {
      console.log(event);
      dispatch(event);
    }
    const { remove } = connector.addEventListener(onEvent);
    connector.open();
    return () => {
      connector.close();
      remove();
    };
  }, [connector, ...deps]);

  const change = (newValue) => {
    if (!connector)
      return;
    connector.send(newValue);
  };

  return [value, change];
};

export {
  useAsync,
  useConnection,
};