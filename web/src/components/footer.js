// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { StyleSheet } from '../lib/style'; */
import { useWildspaceClient, useActiveGame } from "../hooks/useWildspace";
import { useAsync, useConnection } from '../hooks/useAsync';
import { Fragment, h } from "preact";
import { cssClass, cssStylesheet } from "../lib/style";

const footerClass = cssClass('footer', {
  display: 'flex',
  flexDirection: 'row',
  height: '2em',
  width: '100%',
  boxShadow: '0px 0px 15px #c1c1c1',
  flexShrink: '0',
});
export const footerStyles/*: StyleSheet*/ = cssStylesheet([
  footerClass,
]);

const ActiveTrackPlayer = ()/*: Node*/ => {
  const client = useWildspaceClient();
  const activeGame = useActiveGame();
  const [connection] = useAsync(
    async () => activeGame && await client.audio.connectActiveTrack(activeGame.gameId)
  , [client, activeGame]);
  const [activeTrack, setActiveTrack] = useConnection(
    connection, (s, e) => e, null, [client]
  )
  const [trackInfo] = useAsync(
    async () => activeGame && client.audio.getAudioInfo(activeGame.gameId),
    [activeGame, client]
  );

  if (!trackInfo || !activeTrack)
    return null;

  return h('pre', {}, JSON.stringify({
    trackInfo,
    activeTrack,
  }, null, 2));
};

const Footer = ()/*: Node*/ => {
  return h('footer', { class: 'footer' }, [
    h(ActiveTrackPlayer),
  ]);
};

export {
  Footer,
};
