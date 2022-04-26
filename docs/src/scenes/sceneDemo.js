// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type {  } from '@astral-atlas/wildspace-models';
*/
import { SceneBackgroundRenderer, SceneRenderer } from '@astral-atlas/wildspace-components';
import { h, useState } from '@lukekaalim/act';

import cityImgURL from './city.jpg';
import riceFieldURL from './rice_field.jpg';

export const ExpositionSceneDemo/*: Component<>*/ = () => {
  const [activeScene, setActiveScene] = useState('a');
  const sceneA = {
    id: 'a',
    tags: [],
    subject: { type: 'location', location: '0' },
    title: 'demo scene A'
  };
  const sceneB = {
    id: 'b',
    tags: [],
    subject: { type: 'location', location: '1' },
    title: 'demo scene B'
  };
  const sceneC = {
    id: 'c',
    tags: [],
    subject: { type: 'location', location: '2' },
    title: 'demo scene C'
  };
  const gameData = {
    locations: [
      {
        id: '0',
        background: { type: 'image', imageAssetId: 'city' },
        title: 'city',
        description: { type: 'plaintext', plaintext: 'Hello!' },
        tags: [],
      },
      {
        id: '1',
        background: { type: 'image', imageAssetId: 'city' },
        title: 'inner city',
        description: { type: 'plaintext', plaintext: 'The Inner City!' },
        tags: [],
      },
      {
        id: '2',
        background: { type: 'image', imageAssetId: 'rice_field' },
        title: 'rice field',
        description: { type: 'plaintext', plaintext: 'motherfucker' },
        tags: [],
      },
    ],
    scenes: {
      exposition: [sceneA, sceneB, sceneC],
    },
    players: [],
    playlists: [],
    tracks: [],
    assets: new Map([
      ['city', { downloadURL: cityImgURL }],
      ['rice_field', { downloadURL: riceFieldURL }],
    ]),
  }
  const onSceneClick = (id) => () => {
    setActiveScene(id)
  }
  const scene = gameData.scenes.exposition.find(s => s.id === activeScene);

  return [
    h('div', {}, [
      h('div', { style: { display: 'flex' } }, gameData.scenes.exposition.map(scene =>
        h('button', { onClick: onSceneClick(scene.id) }, scene.title))),
      !!scene && [
        h(SceneRenderer, { scene, gameData }),
        h(SceneBackgroundRenderer, { scene, gameData }),
      ]
    ]),
  ]
}