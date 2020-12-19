// @flow strict
/*:: import type { Node } from 'preact'; */
/*:: import type { ActiveTrackUpdateEvent, BackgroundAudioTrack } from '@astral-atlas/wildspace-models'; */
/*:: import type { StyleSheet } from '../lib/style'; */
import { useWildspaceClient, useActiveGame } from "../hooks/useWildspace";
import { useAsync, useConnection } from '../hooks/useAsync';
import { Fragment, h } from "preact";
import { cssClass, cssStylesheet } from "../lib/style";
import { useEffect, useRef, useState } from "preact/hooks";
import { ActiveTrackPlayer } from './audio/backgroundTrackPlayer';

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

const Footer = ()/*: Node*/ => {
  const [allowAudio, toggleAllowAudio] = useState(false);
  return h('footer', { class: 'footer' }, [
    //h('button', { onClick: () => toggleAllowAudio(!allowAudio) }, 'Toggle Synced Audio'),
    h(ActiveTrackPlayer),
  ]);
};

export {
  Footer,
};
