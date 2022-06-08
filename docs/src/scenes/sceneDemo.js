// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type {  } from '@astral-atlas/wildspace-models';
*/
import { SceneBackgroundRenderer, SceneRenderer, useAnimatedKeyedList, useMiniTheaterController, useResourcesLoader } from '@astral-atlas/wildspace-components';
import { h, useEffect, useRef, useState } from '@lukekaalim/act';

import cityImgURL from './city.jpg';
import riceFieldURL from './rice_field.jpg';
import { useAnimationFrame } from "@lukekaalim/act-three/hooks";
import { useAnimation } from '@lukekaalim/act-curve';
import { LayoutDemo } from '../demo';
import { createMockWildspaceClient } from "@astral-atlas/wildspace-test";

export const ExpositionSceneDemo/*: Component<>*/ = () => {
  const sceneA = {
    id: 'a',
    tags: [],
    description: { type: 'inherit' },
    subject: { type: 'location', location: '0' },
    title: 'demo scene A'
  };
  const sceneB = {
    id: 'b',
    tags: [],
    description: { type: 'inherit' },
    subject: { type: 'location', location: '1' },
    title: 'demo scene B'
  };
  const sceneC = {
    id: 'c',
    tags: [],
    description: { type: 'inherit' },
    subject: { type: 'location', location: '2' },
    title: 'demo scene C'
  };
  const sceneD = {
    id: 'd',
    tags: [],
    description: { type: 'inherit' },
    subject: { type: 'location', location: '3' },
    title: 'green'
  };
  const sceneE = {
    id: 'e',
    encounterId: 'ENCOUNTER_A'
  }
  const [activeScene, setActiveScene] = useState({ type: 'exposition', ref: sceneA.id });

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
      {
        id: '3',
        background: { type: 'color', color: 'green' },
        title: 'algae',
        description: { type: 'plaintext', plaintext: 'fields of green' },
        tags: [],
      },
    ],
    scenes: {
      exposition: [sceneA, sceneB, sceneC, sceneD],
      encounter: [sceneE]
    },
    game: {
      id: 'GAME_0',
    },
    characters: [],
    players: [],
    playlists: [],
    tracks: [],
    assets: new Map([
      ['city', { downloadURL: cityImgURL }],
      ['rice_field', { downloadURL: riceFieldURL }],
    ]),
  }
  const onExpositionSceneClick = (id) => () => {
    setActiveScene({ type: 'exposition', ref: id })
  }
  const onEncounterSceneClick = (id) => () => {
    setActiveScene({ type: 'mini-theater', miniTheaterSceneId: id })
  }
  const scene = gameData.scenes.exposition.find(s => s.id === activeScene);

  const [arr, setArr] = useState([{ key: Math.random(), value: 'Original!' }]);
  const reducers = {
    enter(v, i, t) {
      return { enter: t, exit: -1, key: v.key, value: v.value };
    },
    move(v, pi, ni, t) {
      return v;
    },
    exit(v, t) {
      return { enter: v.enter, exit: t, key: v.key, value: v.value};
    }
  }
  const client = createMockWildspaceClient()
  const encounterState = {
    minis: [],
  };
  const roomState/*: any*/ = {
    encounter: encounterState,
  };

  const resources = useResourcesLoader();
  const miniTheaterController = useMiniTheaterController();
  const miniTheaterView = {
    characterPieces: [],
    monsterPieces: [],
    miniTheater: {
      id: 'THEATER_ID',
      characterPieceIds: [],
      monsterPieceIds: [],
      name: ''
    }
  }

  return [
    h('div', { style: { display: 'flex' } }, [
      gameData.scenes.exposition.map(scene =>
        h('button', { onClick: onExpositionSceneClick(scene.id) }, scene.title)),
      gameData.scenes.encounter.map(scene =>
        h('button', { onClick: onEncounterSceneClick(scene.id) }, scene.id)),
    ]),
    h(LayoutDemo, {}, [
      h(SceneBackgroundRenderer, { scene: activeScene, gameData, client, roomState, resources, miniTheaterController, miniTheaterView }),
      h(SceneRenderer, { scene: activeScene, gameData }),
    ]),
  ]
}

const Anim = ({ enter, exit, key, value }) => {
  const duration = 600;
  const ref = useRef();

  useAnimation((now) => {
    const { current: div } = ref;
    if (!div)
      return;
    
    const enterProgress = Math.min(1, (now - enter) / duration);
    const exitProgress = Math.min(1, exit === -1 ? 0 : (now - exit) / duration);
    const progress = exit === -1 ? enterProgress : Math.min(enterProgress, exitProgress);

    div.style.opacity = Math.min(enterProgress, 1 - exitProgress);
    div.style.height = (Math.min(enterProgress, 1 - exitProgress) * 20) + 'px';
    div.style.display = exitProgress === 1 || enterProgress === 0 ? 'none' : 'block';
  
    if (progress >= 1)
      return true;
  }, [enter, exit])

  return h('div', { ref }, value);
}