// @flow strict

import { useState, useEffect } from "@lukekaalim/act"

/*::
import type { GameUpdateTimes } from "../utils/updates";
import type {
  GameID,
  AudioPlaylist, AudioTrack,
  ExpositionScene,
  Location,
} from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";

export type GameData = {
  playlists: $ReadOnlyArray<AudioPlaylist>,
  tracks: $ReadOnlyArray<AudioTrack>,
  locations: $ReadOnlyArray<Location>,
  scenes: {
    exposition: $ReadOnlyArray<ExpositionScene>,
  }
};
*/

const emptyGameData = {
  playlists: [],
  tracks: [],
  locations: [],
  scenes: {
    exposition: []
  }
}

export const useGameData = (
  gameId/*: GameID*/,
  times/*: GameUpdateTimes*/,
  client/*: WildspaceClient*/
)/*: GameData*/ => {
  const [data, setData] = useState/*:: <GameData>*/(emptyGameData)
  
  useEffect(() => {
    client.audio.playlist.list(gameId)
      .then(playlists => setData(d => ({ ...d, playlists })))
  }, [times.playlists])
  useEffect(() => {
    client.audio.tracks.list(gameId)
      .then(tracks => setData(d => ({ ...d, tracks })))
  }, [times.tracks])
  useEffect(() => {
    client.game.location.list(gameId)
      .then(locations => setData(d => ({ ...d, locations })))
  }, [times.locations])
  useEffect(() => {
    client.game.scene.list(gameId)
      .then(exposition => setData(d => ({ ...d, scenes: { ...d.scenes, exposition } })))
  }, [times.scenes])

  return data;
}