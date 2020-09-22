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

export {
  useRoom,
  useRefereeRoom,
};
