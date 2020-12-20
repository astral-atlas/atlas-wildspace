// @flow strict
/*:: import type { Node } from 'preact'; */
import { useWildspaceClient, useActiveGame } from "../../hooks/useWildspace";
import { useAsync, useConnection } from '../../hooks/useAsync';
import { h } from "preact";

export const ActiveTrackSelector = ()/*: Node*/ => {
  const client = useWildspaceClient();
  const activeGame = useActiveGame();
  const [connection] = useAsync(
    async () => activeGame && await client.audio.connectActiveTrack(activeGame.gameId)
  , [client, activeGame]);
  const [activeTrack, setActiveTrack] = useConnection(
    connection, (s, e) => e, null, [client]
  );
  const [trackInfo] = useAsync(
    async () => activeGame && client.audio.getAudioInfo(activeGame.gameId),
    [activeGame, client]
  );
  if (!trackInfo)
    return null;
  
  return h('ul', {}, [
    ...trackInfo.tracks.map(track => {
      return h('button', { onClick: () => setActiveTrack({
        type: 'update',
        distanceSeconds: 0,
        trackId: track.id,
        fromUnixTime: Date.now(),
      }) }, track.name)
    })
  ]);
};