// @flow strict
/*:: import type { Game } from '@astral-atlas/wildspace-models'; */
/*:: import type { WildspaceClient, Store } from '@astral-atlas/wildspace-client'; */
import { useEffect, useState } from 'preact/hooks';
import { useWildspaceClient } from '../context/wildspaceContext';
import { useStore } from '../context/appContext';

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

const useActiveGame = ()/*: ?Game*/ => {
  const client = useWildspaceClient();
  const [store] = useStore();
  const activeGameId = store.game.activeGameId;

  const [gameIds] = useAsync(async () => {
    return client.game.getGameIds();
  }, [client]);
  const [activeGame] = useAsync(async () => {
    if (!gameIds)
      return null;
    if (!activeGameId)
      return null;
    if (!gameIds.includes(activeGameId))
      return null;
    return await client.game.getGame(activeGameId);
  }, [client, gameIds, activeGameId])

  return activeGame;
}

export {
  useActiveGame,
  useAsync,
  useStore,
  useWildspaceClient,
};
