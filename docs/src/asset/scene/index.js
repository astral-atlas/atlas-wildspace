// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */

import { createWildspaceClient } from "@astral-atlas/wildspace-client2";
import { useGameData, useGameUpdateTimes } from "@astral-atlas/wildspace-components";
import { createContext, h } from "@lukekaalim/act";
import { Document, Markdown } from "@lukekaalim/act-rehersal";

import audioText from './index.md?raw';

const SceneAssetLibraryDemo = () => {
  const gameId = '0';

  const client = createWildspaceClient(null, 'http://127.0.0.1:5567', 'ws://127.0.0.1:5567');
  const times = useGameUpdateTimes(client.game, gameId);
  const data = useGameData(gameId, times, client);

  return h('pre', {}, JSON.stringify(data, null, 2));
};

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'sceneAssetLibrary':
      return h(SceneAssetLibraryDemo)
    default:
      throw new Error();
  }
};

const directives = {
  demo: Demo,
}

export const assetScenePage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: audioText, directives })),
  link: { children: [
    
  ], name: 'Scene', href: '/assets/scene' }
}

export const assetScenePages/*: Page[]*/ = [
  assetScenePage,
];