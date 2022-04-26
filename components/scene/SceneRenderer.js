// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { ExpositionScene, EncounterScene } from '@astral-atlas/wildspace-models';
import type { GameData } from "../game/data";
*/

import { h, useRef } from "@lukekaalim/act";
import styles from './SceneRenderer.module.css';
import { MarkdownRenderer } from "@lukekaalim/act-markdown/entry";
import { useAnimatedList, useBezierAnimation } from "@lukekaalim/act-curve";

/*::
export type SceneRendererProps = {
  scene: ExpositionScene,
  gameData: GameData
};
*/

const getContentForSubject = (subject, npcs, locations) => {
  switch (subject.type) {
    case 'location':
      const location = locations.find(l => l.id === subject.location);
      if (!location)
        return null;
      return location.description;
    default:
      return null;
  }
}
const getContentForScene = (scene, npcs, locations) => {
  switch (scene.description.type) {
    case 'inherit':
      return getContentForSubject(scene.subject, npcs, locations)
    case 'plaintext':
      return scene.description;
  }
}

export const SceneRenderer/*: Component<SceneRendererProps>*/ = ({ scene, gameData }) => {
  const description = getContentForScene(scene, [], gameData.locations);

  if (!description)
    return null;

  return h('div', { className: styles.scene }, [
    h('article', { className: styles.content }, [
      h('div', {}, [
        h(MarkdownRenderer, { markdownText: description.plaintext }),
      ])
    ])
  ])
};

/*::
export type SceneBackgroundRendererProps = {
  scene: ExpositionScene,
  gameData: GameData
};
*/

const getBackgroundForSubject = (subject, locations) => {
  switch (subject.type) {
    case 'none':
      return null;
    case 'location':
      const location = locations.find(l => l.id === subject.location);
      if (!location)
        return null;
      return location.background;
    case 'npc':
      const npcLocation = locations.find(l => l.id === subject.location)
      if (!npcLocation)
        return null;
      return npcLocation.background;
  }
}

const SceneBackgroundImage = ({ animation }) => {
  const ref = useRef/*:: <?HTMLElement>*/()
  useBezierAnimation(animation.status, (point) => {
    const { current: div } = ref;
    if (!div)
      return;
    
    const opacity = Math.min(1, Math.max(0, 1 - Math.abs(point.position) * 4));
    div.style.opacity = `${opacity}`;
  })

  return h('div', {
    ref,
    className: styles.background,
    style: { backgroundImage: `url(${animation.value})` }
  });
}

const SceneBackgroundImageRenderer = ({ background, assets }) => {
  if (!background.imageAssetId)
    return '<NO ID>';
  const asset = assets.get(background.imageAssetId)
  if (!asset)
    return '<NO ASSET>';

  const [imageAnimations] = useAnimatedList([asset.downloadURL], [], { statusDurationMs: 3000, statusImpulse: 0, indexDurationMs: 0, indexImpulse: 0 })

  return h('div', { className: styles.backgroundContainer }, [
    imageAnimations.map(animation => h(SceneBackgroundImage, { animation }))
  ]);
}

export const SceneBackgroundRenderer/*: Component<SceneBackgroundRendererProps>*/ = ({ scene, gameData }) => {
  const background = getBackgroundForSubject(scene.subject, gameData.locations);

  if (!background)
    return '<NO BG>';

  switch (background.type) {
    case 'image':
      return h(SceneBackgroundImageRenderer, { assets: gameData.assets, background });
    case 'color':
      return h('div', { className: styles.background, style: { backgroundColor: background.color } });
  }
}

