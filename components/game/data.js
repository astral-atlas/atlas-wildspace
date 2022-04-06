// @flow strict

import { useState, useEffect } from "@lukekaalim/act"

/*::
import type { GameUpdateTimes } from "../utils/updates";
import type {
  GameID,
  AudioPlaylist, AudioTrack
} from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";

export type GameData = {
  playlists: $ReadOnlyArray<AudioPlaylist>,
  tracks: $ReadOnlyArray<AudioTrack>,
};
*/

export const useGameData = (
  gameId/*: GameID*/,
  times/*: GameUpdateTimes*/,
  client/*: WildspaceClient*/
)/*: GameData*/ => {
  const [data, setData] = useState/*:: <GameData>*/({ playlists: [], tracks: [] })
  
  useEffect(() => {
    client.audio.playlist.list(gameId)
      .then(playlists => setData(d => ({ ...d, playlists })))
  }, [times.playlists])
  useEffect(() => {
    client.audio.tracks.list(gameId)
      .then(tracks => setData(d => ({ ...d, tracks })))
  }, [times.tracks])

  return data;
}