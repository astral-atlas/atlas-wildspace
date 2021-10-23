// @flow strict
/*:: import type { Context, Component } from '@lukekaalim/act'; */
/*:: import type { WildspaceClient } from '@astral-atlas/wildspace-client2'; */
/*:: import type {
  AudioPlaylistState, EncounterState, RoomID, GameID,
  Encounter, Character, AudioTrack, AudioPlaylist,
  Room, Player
} from '@astral-atlas/wildspace-models'; */
import { h, useContext, createContext, useState, useEffect } from "@lukekaalim/act";

export const apiContext/*: Context<?WildspaceClient>*/ = createContext(null);

export const APIProvider/*: Component<{ client: WildspaceClient }>*/ = ({ client, children }) => {
  return h(apiContext.Provider, { value: client }, children)
};
export const useAPI = ()/*: WildspaceClient*/ => {
  const client = useContext(apiContext);
  if (!client)
    throw new Error();
  return client;
};


export const useRoom = (gameId/*: ?GameID*/, roomId/*: ?RoomID*/)/*: { audio: ?AudioPlaylistState, encounter: ?EncounterState }*/ => {
  const api = useAPI();
  const [audio, setAudio] = useState(null);
  const [encounter, setEncounter] = useState(null);

  useEffect(() => {
    if (!gameId || !roomId)
      return;
    const { close } = api.room.connectUpdates(gameId, roomId, async (update) => {
      switch (update.type) {
        case 'audio':
          return setAudio(update.audio);
        case 'encounter':
          return setEncounter(update.encounter);
      }
    });
    api.room.readAudio(gameId, roomId).then(setAudio);
    api.room.readEncounter(gameId, roomId).then(setEncounter);

    return () => {
      close();
    };
  }, [gameId, roomId, api])

  return { audio, encounter };
};

/*::
export type GameData = {
  characters: Character[],
  encounters: Encounter[],
  rooms: Room[],
  tracks: AudioTrack[],
  playlists: AudioPlaylist[],
  players: Player[],
};
*/

export const useGame = (gameId/*: ?GameID*/)/*: GameData*/ => {
  const api = useAPI();
  const [characters, setCharacters] = useState([]);
  const [players, setPlayers] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [encounters, setEncounters] = useState([]);
  const [tracks, setTracks] = useState([]);
  const [playlists, setPlaylists] = useState([]);

  useEffect(() => {
    if (!gameId)
      return;

    const { close } = api.game.connectUpdates(gameId, async (update) => {
      switch (update.type) {
        case 'characters':
          return setCharacters([...await api.game.character.list(gameId)]);
        case 'rooms':
          return setRooms([...await api.room.list(gameId)]);
        case 'encounters':
          return setEncounters([...await api.game.encounter.list(gameId)]);
        case 'playlists':
          return setPlaylists([...await api.audio.playlist.list(gameId)]);
        case 'tracks':
          return setTracks([...await api.audio.tracks.list(gameId)]);
        case 'players':
          return setPlayers([...await api.game.players.list(gameId)]);
      }
    });
    api.game.character.list(gameId).then(c => setCharacters([...c]));
    api.game.encounter.list(gameId).then(e => setEncounters([...e]));
    api.game.players.list(gameId).then(p => setPlayers([...p]));
    api.room.list(gameId).then(r => setRooms([...r]));
    api.audio.playlist.list(gameId).then(p => setPlaylists([...p]));
    api.audio.tracks.list(gameId).then(p => setTracks([...p]));

    return () => {
      close();
    };
  }, [gameId, api])

  if (!gameId)
    return { rooms: [], characters: [], encounters: [], playlists: [], tracks: [], players: [] };

  return {
    rooms,
    characters,
    encounters,
    players,
    playlists,
    tracks,
  }
}