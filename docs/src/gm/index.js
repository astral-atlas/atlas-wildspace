// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */

import { useAsync, useGameUpdateTimes } from "@astral-atlas/wildspace-components";
import { AudioStateEditor } from "@astral-atlas/wildspace-components/game/audio";
import { useGameData } from "@astral-atlas/wildspace-components/game/data";
import { h, useEffect, useState } from "@lukekaalim/act";
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import editorsText from './index.md?raw';
import { createWildspaceClient } from "@astral-atlas/wildspace-client2";

const GMAudioDemo = () => {
  const client = createWildspaceClient(null, 'http://localhost:5567', 'ws://localhost:5567')
  const times = useGameUpdateTimes(client.game, '0')
  const gameData = useGameData('0', times, client);
  const initState = {
    volume: 1,
    playback: { type: 'playlist', playlist: {
      id: gameData.playlists[0].id,
      mode: { type: 'playing', startTime: Date.now() }
    } }
  };
  const [state, setState] = useState(initState);
  const setAudio = async (gameId, roomId, state) => {
    setState(state);
  };
  const roomClient = { setAudio };
  const [assets] = useAsync(async () => {
    const assets = await Promise.all(gameData.tracks
      .map(track => client.asset.peek(track.trackAudioAssetId))
    );
    return assets.map(a => ({ id: a.description.id, url: a.downloadURL }));
  }, [gameData.tracks])
  return h(AudioStateEditor, { gameData, state, client: roomClient, gameId: '0', roomId: '0', assets: assets || [] })
};

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'audio':
      return h(GMAudioDemo);
    default:
      throw new Error();
  }
};

const directives = {
  demo: Demo,
}

export const gmPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: editorsText, directives })),
  link: { children: [

  ], name: 'Game Master Tools', href: '/game-master-tools' }
}

export const gmPages/*: Page[]*/ = [
  gmPage,
];