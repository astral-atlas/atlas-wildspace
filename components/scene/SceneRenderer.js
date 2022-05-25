// @flow strict
/*::
import type { Component } from '@lukekaalim/act';
import type { ExpositionScene, EncounterScene, SceneRef, RoomState } from '@astral-atlas/wildspace-models';
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { GameData } from "../game/data";
*/

import { h, useRef } from "@lukekaalim/act";
import styles from './SceneRenderer.module.css';
import { MarkdownRenderer } from "@lukekaalim/act-markdown/entry";
import { calculateCubicBezierAnimationPoint, createInitialCubicBezierAnimation, getCubicPoint, interpolateCubicBezierAnimation, maxSpan, useAnimatedList, useBezierAnimation, useTimeSpan } from "@lukekaalim/act-curve";
import { useAnimatedKeyedList } from "../animation/list";
import { useRefMap } from "../editor";
import { hash } from 'spark-md5';
import { EncounterSceneRenderer } from "./EncounterSceneRenderer";

/*::
export type SceneRendererProps = {
  scene: SceneRef,
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
    case 'none':
      return null;
  }
}

const textReducer = {
  enter: (v, i, t) => ({ anim: interpolateCubicBezierAnimation(createInitialCubicBezierAnimation(-1), 0, 3000, 0, t), v }),
  move: (s, i1, i2, t) => s,
  update: (s, v, t) => ({ ...s, v }),
  exit: (s, t) => ({ ...s, anim: interpolateCubicBezierAnimation(s.anim, 1, 3000, 0, t) }),
}

export const SceneRenderer/*: Component<SceneRendererProps>*/ = ({ scene, gameData }) => {
  switch (scene.type) {
    case 'exposition':
      const expositionScene = gameData.scenes.exposition.find(s => s.id === scene.ref);
      if (!expositionScene)
        return null;
      return h(ExpositionSceneRenderer, { scene: expositionScene, gameData });
    case 'encounter':
      return null;
  }
}

/*::
export type ExpositionSceneRendererProps = {
  scene: ExpositionScene,
  gameData: GameData,
};
*/
export const ExpositionSceneRenderer/*: Component<ExpositionSceneRendererProps>*/ = ({ scene, gameData }) => {
  const description = getContentForScene(scene, [], gameData.locations);

  if (!description)
    return null;

  const textAnims = useAnimatedKeyedList([description.plaintext], p => p, s => s.anim.span.start + s.anim.span.durationMs, textReducer, [description.plaintext])


  const [refKey, refMap] = useRefMap()
  useTimeSpan(maxSpan(textAnims.map(a => a.anim.span)), now => {
    for (const { anim, v } of textAnims) {
      const point = calculateCubicBezierAnimationPoint(anim, now);
      const div = refMap.get(v);
      if (div) {
        div.style.transform = `translate(0px, ${(point.position * 400)}px)`
        div.style.opacity = 1 - Math.abs(point.position) * 4;
      }
    }
  }, [textAnims])

  const textElements = textAnims.map(({ v, anim }) =>
    h('div', { key: hash(v), ref: refKey(v), className: styles.contentContainer }, [
      h(MarkdownRenderer, { markdownText: v }),
    ]))

  return h('div', { className: styles.scene },
    h('article', { className: styles.content }, textElements)
  )
};


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

const SceneBackgroundImageRenderer = ({ anim, background, assets }) => {
  if (!background.imageAssetId)
    return '<NO ID>';
  const asset = assets.get(background.imageAssetId)

  if (!asset)
    return '<NO ASSET>';

  const ref = useFadeBezierRef(anim)

  const [imageAnimations] = useAnimatedList([asset.downloadURL], [], { statusDurationMs: 3000, statusImpulse: 0, indexDurationMs: 0, indexImpulse: 0 })

  return h('div', { ref }, [
    imageAnimations.map(animation => h(SceneBackgroundImage, { animation }))
  ]);
}

const reducers = {
  enter(background, i, t) {
    return {
      background,
      anim: interpolateCubicBezierAnimation(
        createInitialCubicBezierAnimation(-1),
        0,
        3000,
        0,
        t
      )
    }
  },
  move(v) {
    return v;
  },
  update(s, background) {
    return {
      ...s,
      background,
    }
  },
  exit(s, t) {
    return {
      ...s,
      anim: interpolateCubicBezierAnimation(s.anim, 1, 3000, 0, t)
    };
  }
};

/*::
export type SceneBackgroundRendererProps = {
  scene: SceneRef,
  gameData: GameData,
  roomState: RoomState,
  client: WildspaceClient,
};
*/

export const SceneBackgroundRenderer/*: Component<SceneBackgroundRendererProps>*/ = ({ scene, gameData, roomState, client }) => {
  switch (scene.type) {
    case 'exposition':
      const expositionScene = gameData.scenes.exposition.find(s => s.id === scene.ref);
      if (!expositionScene)
        return null;
      return h(ExpositionSceneBackgroundRenderer, { scene: expositionScene, gameData });
    case 'encounter':
      return h(EncounterSceneRenderer, {
        gameId: gameData.game.id,
        roomId: roomState.roomId,
        assets: gameData.assets,
        characters: gameData.characters,
        client,
        encounterState: roomState.encounter,
      });
  }
}

/*::
export type ExpositionSceneBackgroundRendererProps = {
  scene: ExpositionScene,
  gameData: GameData,
}
*/

export const ExpositionSceneBackgroundRenderer/*: Component<ExpositionSceneBackgroundRendererProps>*/ = ({ scene, gameData }) => {
  const background = getBackgroundForSubject(scene.subject, gameData.locations);

  if (!background)
    return null;
  
  const backgroundAnim = useAnimatedKeyedList([background], s => s.type, s => s.anim.span.start + s.anim.span.durationMs, reducers, [background], {
    initial: new Map([[background.type, { background, anim: createInitialCubicBezierAnimation(0) }]])
  })

  const backgroundElements = [...backgroundAnim].sort((a, b) => a.background.type === 'image' ? 1 : -1).map(({ anim, background }) => {
    switch (background.type) {
      case 'image':
        return h(SceneBackgroundImageRenderer, { key: background.type, anim, assets: gameData.assets, background });
      case 'color':
        return h(SceneBackgrouncColorRenderer, { key: background.type, anim, color: background.color });
    }
  })
  return h('div', { className: styles.backgroundContainer }, backgroundElements);
}

const useFadeBezierRef = (anim) => {
  const ref = useRef();
  useBezierAnimation(anim, point => {
    const { current: div } = ref;
    if (!div)
      return;
    div.style.opacity = (1 - Math.abs(point.position) * 4);
  });
  return ref;
}

const SceneBackgrouncColorRenderer = ({ anim, color }) => {
  const ref = useFadeBezierRef(anim)
  return h('div', { ref, className: styles.background, style: { backgroundColor: color } });
}
