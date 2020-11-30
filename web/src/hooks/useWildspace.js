// @flow strict
/*:: import type { Game } from '@astral-atlas/wildspace-models'; */
/*:: import type { WildspaceClient, Store } from '@astral-atlas/wildspace-client'; */
import { useEffect, useState } from 'preact/hooks';
import { useWildspaceClient } from '../context/wildspaceContext';

const useRefereeRoom = (roomId, refereeSecret, updateInterval) => {
  const [room, setLocalRoom] = useState(null);
  const [error, setError] = useState(null);
  const client = useWildspaceClient();

  useEffect(() => {
    const updateRoom = async () => {
      try {
        const room = await client.rooms.referee.read(roomId, refereeSecret);
        setError(null);
        setLocalRoom(room);
      } catch (error) {
        console.error(error);
        setError(error);
        setLocalRoom(null);
      }
    }
    updateRoom();
    const intervalId = setInterval(updateRoom, updateInterval);
    return () => clearInterval(intervalId);
  }, [roomId, refereeSecret, updateInterval]);

  const setRoom = async (newRoom) => {
    setError(null);
    setLocalRoom(newRoom);
    try {
      const updatedRoom = await client.rooms.referee.update(roomId, refereeSecret, newRoom);
      setLocalRoom(updatedRoom);
    } catch (error) {
      console.error(error);
      setError(error);
      setLocalRoom(null);
    }
  };

  return [room, setRoom, error];
};

const useRoom = (roomId, playerSecret, updateInterval) => {
  const [room, setLocalRoom] = useState(null);
  const [error, setError] = useState(null);
  const client = useWildspaceClient();

  useEffect(() => {
    const updateRoom = async () => {
      try {
        const room = await client.rooms.player.read(roomId, playerSecret);
        setError(null);
        setLocalRoom(room);
      } catch (error) {
        console.error(error);
        setError(error);
        setLocalRoom(null);
      }
    }
    updateRoom();
    const intervalId = setInterval(updateRoom, updateInterval);
    return () => clearInterval(intervalId);
  }, [roomId, playerSecret, updateInterval]);

  return [room, error];
};

const useData = /*::<T>*/(getData/*: WildspaceClient => Promise<T>*/)/*: ?T*/ => {
  const [state, setState] = useState(null);
  const client = useWildspaceClient();

  useEffect(() => void (async () => {
    setState(await getData(client));
  })(), [client]);

  return state;
};

const useAsync = /*::<T>*/(getData/*: () => Promise<T>*/, deps/*: mixed[]*/)/*: ?T*/ => {
  const [state, setState] = useState(null);

  useEffect(() => void (async () => {
    setState(await getData());
  })(), deps);

  return state;
};

const useGames = (client/*: WildspaceClient*/)/*: ?Game[]*/ => {
  const [games, setGames] = useState(null);

  useEffect(() => void (async () => {
    setGames(await client.game.listGames());
  })(), [client]);

  return games;
};

const useStoreIds = ()/*: ?string[]*/ => {
  return useData(async client => await client.store.listStoreIds());
};
const useStore = (id/*: string*/)/*: ?Store*/ => {
  return useData(async client => await client.store.getStore(id));
};

export {
  useStoreIds,
  useGames,
  useAsync,
  useData,
  useStore,
  useWildspaceClient,
};
