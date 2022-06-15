// @flow strict
/*::
import type { Component, Ref } from '@lukekaalim/act';
import type {
  Scene, SceneID,
  Exposition,
  RoomState, GamePage,
  MonsterActorMask,
  Character,
  RoomPage
} from '@astral-atlas/wildspace-models';

import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { GameData } from "../game/data";
import type { MiniTheater } from "../../models/game/miniTheater";
import type { MiniTheaterController } from "../miniTheater/useMiniTheaterController";
import type { EncounterResources } from "../encounter/useResources";
import type { AssetDownloadURLMap } from "../asset/map";
import type { KeyboardStateEmitter } from "../keyboard/changes";
*/

import { h, useEffect, useRef } from "@lukekaalim/act";
import styles from './SceneRenderer.module.css';
import { MarkdownRenderer } from "@lukekaalim/act-markdown/entry";
import { calculateCubicBezierAnimationPoint, createInitialCubicBezierAnimation, getCubicPoint, interpolateCubicBezierAnimation, maxSpan, useAnimatedList, useBezierAnimation, useTimeSpan } from "@lukekaalim/act-curve";
import { useAnimatedKeyedList } from "../animation/list";
import { useRefMap } from "../editor";
import { hash } from 'spark-md5';
import { EncounterSceneRenderer } from "./EncounterSceneRenderer";
import { MiniTheaterCanvas } from "../miniTheater/MiniTheaterCanvas";
import { useMiniTheaterController } from "../miniTheater/useMiniTheaterController";
import { useResourcesLoader } from "../encounter";
import { useFadeTransition } from "../transitions";

/*::
export type SceneRendererProps = {
  sceneId: SceneID,
  gameData: GameData,
  client: WildspaceClient,
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
const getDescriptionForExpositionSubject = (subject, npcs, locations) => {
  switch (subject.type) {
    case 'location':
      const location = locations.find(l => l.id === subject.locationId);
      if (!location)
        return null;
      return location.description.plaintext;
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

export const SceneRenderer/*: Component<SceneRendererProps>*/ = ({ sceneId, gameData, client }) => {
  const scene = gameData.scenes.find(s => sceneId === s.id);
  if (!scene)
    return null;
  const { content } = scene;
  const controller = useMiniTheaterController();
  const resources = useResourcesLoader();

  useEffect(() => {
    if (content.type !== 'mini-theater')
      return;
    return controller.subscribeAction(act => client.game.miniTheater.act(gameData.game.id, content.miniTheaterId, act))
  }, [])

  switch (content.type) {
    case 'exposition':
      const exposition = gameData.expositions.find(e => e.id === content.expositionId);
      if (!exposition)
        return null;
      return h(ExpositionSceneRenderer, { scene, exposition, gameData });
    case 'mini-theater':
      const miniTheater = gameData.miniTheaters.find(m => m.id == content.miniTheaterId);
      if (!miniTheater)
        return null;
      return [
        h(MiniTheaterCanvas, {
          assets: gameData.assets,
          characters: gameData.characters,
          monsters: [],//gameData.monsterMasks,
          miniTheater,
          controller,
          resources,
        })
      ];
    default:
      return null;
  }
}

/*::
export type ExpositionSceneRendererProps = {
  scene: Scene,
  exposition: Exposition,
  gameData: GameData,
};
*/
export const ExpositionSceneRenderer/*: Component<ExpositionSceneRendererProps>*/ = ({ scene, exposition, gameData }) => {
  const description = exposition.overrideText || getDescriptionForExpositionSubject(exposition.subject, [], gameData.locations);

  if (!description)
    return null;

  const textAnims = useAnimatedKeyedList(
    [description],
    p => p,
    s => s.anim.span.start + s.anim.span.durationMs,
    textReducer,
    [description]
  )


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
  sceneBackground: SceneBackround,

  assets: AssetDownloadURLMap,
  emitter: KeyboardStateEmitter,
};

export type SceneBackround =
  | { type: 'none' }
  | { type: 'color', color: string }
  | { type: 'image', imageURL: string }
  | {
      type: 'mini-theater',
      miniTheater: MiniTheater,
      characters: $ReadOnlyArray<Character>,
      monsterMasks: $ReadOnlyArray<MonsterActorMask>,
      controller: MiniTheaterController,
      controlSurfaceElementRef: ?Ref<?HTMLElement>,
    }
*/
export const useSceneBackground = (
  roomPage/*: ?RoomPage*/ = null,
  gamePage/*: ?GamePage*/ = null,
  miniTheater/*: ?MiniTheater*/ = null,
  controller/*: ?MiniTheaterController*/ = null,
  controlSurfaceElementRef/*: ?Ref<?HTMLElement>*/ = null
)/*: SceneBackround*/ => {
  if (!roomPage || !gamePage)
    return { type: 'none' };
  const { scene } = roomPage;
  const { characters, monsterMasks } = gamePage;

  if (!scene)
    return { type: 'none' }
  const { content } = scene;
  switch (content.type) {
    default:
      return { type: 'none' };
    case 'mini-theater':
      if (!controller || !miniTheater)
        return { type: 'none' };
        
      return { type: 'mini-theater', miniTheater, characters, monsterMasks, controller, controlSurfaceElementRef }
  }
}
const HARDCODED_BOARD = {
  id: 'BOARD_0',
  floors: [
    { type: 'box', box: {
      position: { x: 1, y: 0, z: 0 },
      size: { x: 30, y: 24, z: 1 }
    } }
  ]
};
export const SceneBackgroundRenderer/*: Component<SceneBackgroundRendererProps>*/ = ({
  sceneBackground,
  assets,
  emitter,
}) => {
  const resources = useResourcesLoader();
  const [,anims] = useFadeTransition(sceneBackground, s => s.type, [sceneBackground])

  return anims.map(({ value: sceneBackground }) => {
    switch (sceneBackground.type) {
      case 'color':
      case 'image':
        return null;

      case 'mini-theater':
        const { miniTheater, characters, monsterMasks, controller, controlSurfaceElementRef } = sceneBackground;
        return h(MiniTheaterCanvas, { 
          assets, characters, controller,
          miniTheater, monsterMasks, resources,
          controlSurfaceElementRef, emitter
        })
      default:
        return null;
    }
  })

}

/*::
export type ExpositionSceneBackgroundRendererProps = {
  exposition: Exposition,
  gameData: GameData,
}
*/

export const ExpositionSceneBackgroundRenderer/*: Component<ExpositionSceneBackgroundRendererProps>*/ = ({ exposition, gameData }) => {
  const background = getBackgroundForSubject(exposition.subject, gameData.locations);

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
