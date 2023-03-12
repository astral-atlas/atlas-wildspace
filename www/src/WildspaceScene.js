// @flow strict
/*::
import type { RoomController } from "./room/useRoomController";
import type { MiniTheater, MiniTheaterID, ExpositionID, RoomPage } from "@astral-atlas/wildspace-models";
import type { Component, Ref } from "@lukekaalim/act";
import type { CubicBezierAnimation } from "@lukekaalim/act-curve/bezier";
*/

import { MiniTheaterCanvas, ToolbarPalette, useFadeTransition, useMiniTheaterController, useResourcesLoader } from "@astral-atlas/wildspace-components";
import { useKeyboardStateEmitterMiddleware } from "@astral-atlas/wildspace-components/keyboard/middleware";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";

import styles from './WildspaceScene.module.css';
import { calculateCubicBezierAnimationPoint, useBezierAnimation, useTimeSpan } from "@lukekaalim/act-curve";
import { maxSpan } from "@lukekaalim/act-curve/schedule";

/*::
export type WildspaceSceneProps = {
  roomController: RoomController,
  attachementRef: Ref<?HTMLElement>
};
*/

export const WildspaceScene/*: Component<WildspaceSceneProps>*/ = ({ roomController, attachementRef }) => {
  const { gamePage, roomPage } = roomController
  const { state } = roomPage;

  const content = scene && scene.content || { type: 'none' };
  const anims = useFadeTransition({ roomPage, content }, ({ content }) => content.type, [content, roomPage]);
  return anims.map(({ key, anim, value: { roomPage, content } }) => {
    switch (content.type) {
      case 'mini-theater':
        return h(WildspaceMiniTheaterScene, {
          key,
          anim,
          attachementRef,
          roomController,
          miniTheaterId: content.miniTheaterId
        })
      case 'exposition':
        return h(WildspaceExpositionScene, {
          key,
          anim,
          attachementRef,
          roomController,
          roomPage,
          expositionId: content.expositionId,
        })
      default:
        return null;
    }
  })
};

/*::
export type WildspaceMiniTheaterSceneProps = {
  miniTheaterId: MiniTheaterID,
  roomController: RoomController,
  anim: CubicBezierAnimation,
  attachementRef: Ref<?HTMLElement>
};
*/

export const WildspaceMiniTheaterScene/*: Component<WildspaceMiniTheaterSceneProps>*/ = ({
  miniTheaterId,
  anim,
  attachementRef,
  roomController
}) => {
  const miniTheaterController = useMiniTheaterController();
  const { assets, gamePage, emitter, userId, isGM } = roomController;
  const { characters, monsterMasks } = gamePage;
  const resources = useResourcesLoader();

  const [miniTheater, setMiniTheater] = useState(null)
  useEffect(() => {
    return roomController.updates.miniTheater.subscribe(miniTheaterId, setMiniTheater);
  }, [miniTheaterId, roomController.updates.miniTheater]);
  useEffect(() => {
    return miniTheaterController.subscribeAction(action => roomController.updates.miniTheater.act(miniTheaterId, action))
  }, [miniTheaterId, roomController.updates.miniTheater]);

  const backgroundRef = useRef()
  useEffect(() => {
    const { current: attachement } = attachementRef;
    const { current: background } = backgroundRef;
    if (!attachement || !background)
      return null;

    attachement.appendChild(background);
  }, [])
  const screenRef = useRef();

  const onCharacterToolClick = (character) => () => {
    miniTheaterController.pickPlacement({ type: 'character', characterId: character.id })
  }
  const onMonsterToolClick = (monsterMask) => () => {
    miniTheaterController.pickPlacement({ type: 'monster', monsterActorId: monsterMask.id })
  }
  const onTerrainToolClick = (terrainType) => () => {
    miniTheaterController.pickPlacement({ type: 'terrain', terrainType })
  }

  const [selected, setSelected] = useState(null);
  useEffect(() => miniTheaterController.subscribeSelection(setSelected), []);

  const tools = [
    ...characters
      .filter(c => c.playerId === userId)
      .map(c => ({
        type: 'action',
        title: c.name,
        onAction: onCharacterToolClick(c),
        iconURL: c.initiativeIconAssetId && assets.get(c.initiativeIconAssetId)?.downloadURL || ''
      })),
    ...isGM ? [
      ...monsterMasks
        .map(mm => ({
          type: 'action',
          title: mm.name,
          onAction: onMonsterToolClick(mm),
          iconURL: mm.initiativeIconAssetId && assets.get(mm.initiativeIconAssetId)?.downloadURL || ''
        })),
      {
        type: 'swatch',
        title: 'terrain',
        tools: [
          ...['box', 'WoodenPlatform', 'SwampTree', 'Stump', 'LilyPad'].map(terrainType => ({
            type: 'action',
            onAction: onTerrainToolClick(terrainType),
            title: terrainType,
            iconURL: ''
          }))
        ]
      },
      selected && {
        type: 'action',
        title: 'Delete Selected',
        onAction: () => {
          miniTheaterController.removePiece(selected.pieceRef);
        }
      }
    ].filter(Boolean) : []
  ];

  const onBlur = () => {
    console.log('lol!')
  }
  const onFocus = () => {

  }
  useBezierAnimation(anim, (point) => {
    const { current: background } = backgroundRef;
    const { current: screen } = screenRef;
    if (!background || !screen)
      return;
    background.style.opacity = point.position.toString();
    screen.style.opacity = point.position.toString();
  })

  useEffect(() => {
    const { current: screen } = screenRef;
    const { current: background } = backgroundRef;
    if (!screen || !background)
      return;

    let activeElement = document.activeElement;
    const onFocusIn = (event/*: FocusEvent*/) => {
      activeElement = event.target
    };
    const onFocusOut  = (event/*: FocusEvent*/) => {
      activeElement = null
    }
    background.addEventListener('focusin', onFocusIn);
    background.addEventListener('focusout', onFocusOut);
    const observer = new MutationObserver(records => {
      const removed = new Set(records.map(r => [...r.removedNodes]).flat(1));
      if (removed.has(activeElement)) {
        screen.focus();
        activeElement = null;
      }
    })
    observer.observe(background, { childList: true, subtree: true })
  }, [])

  return [
    h('div', { ref: screenRef, className: styles.sceneScreen, tabIndex: 0 }, [
      h('div', { class: styles.sceneToolbar }, h(ToolbarPalette, { tools })),
    ]),
    h('detached', {}, h('div', { ref: backgroundRef, className: styles.backgroundCanvas }, [
      !!miniTheater && h(MiniTheaterCanvas, {
        assets,
        characters,
        controller: miniTheaterController,
        miniTheater,
        monsterMasks,
        resources,
        emitter,
        swampResources: roomController.swampResources,
        controlSurfaceElementRef: screenRef
      })
    ])),
  ]
}

/*::
export type WildspaceExpositionSceneProps = {
  attachementRef: Ref<?HTMLElement>,
  expositionId: ExpositionID,
  roomController: RoomController,
  roomPage: RoomPage,
  anim: CubicBezierAnimation,
};
*/

export const WildspaceExpositionScene/*: Component<WildspaceExpositionSceneProps>*/ = ({
  attachementRef,
  expositionId,
  roomController,
  roomPage,
  anim: expositionAnim
}) => {

  const backgroundRef = useRef()
  const screenRef = useRef();
  useEffect(() => {
    const { current: attachement } = attachementRef;
    const { current: background } = backgroundRef;
    if (!attachement || !background)
      return null;

    attachement.appendChild(background);
  }, [])

  const { assets } = roomController;
  const { expositions, locations } = roomPage;

  const exposition = expositions.find(e => e.id === expositionId);

  const getBackgroundForSubject = (subject) => {
    switch (subject.type) {
      case 'location':
        const location = locations.find(l => l.id === subject.locationId);
        if (!location)
          return null;
        return location.background;
      default:
        return null;
    }
  };
  const getBackgroundKey = ({ background }) => {
    if (!background)
      return 'none';
    switch (background.type) {
      case 'color':
        return background.color;
      case 'image':
        return background.imageAssetId || 'none';
      default:
        return 'none';
    }
  }
  const background = exposition && getBackgroundForSubject(exposition.subject);
  const anims = useFadeTransition({ background, assets }, getBackgroundKey, [background]);

  return [
    h('div', { ref: screenRef, className: styles.sceneScreen, tabIndex: 0 }, [
      !!exposition && h(ExpositionScreen, { exposition, roomPage })
    ]),
    h('detached', {}, h('div', { ref: backgroundRef, className: styles.backgroundCanvas }, [
      anims.map(({ anim, key, value: { background, assets } }) => {
        return h(ExpositionBackground, { key, background, assets, anim, expositionAnim });
      }),
    ])),
  ]
}

const ExpositionScreen = ({ exposition, roomPage }) => {

  const getSubjectText = (subject) => {
    switch (subject.type) {
      case 'location':
        const location = roomPage.locations.find(l => l.id == subject.locationId);
        if (!location)
          return null;
        return location.description.plaintext;
      default:
      case 'none':
        return null
    }
  }

  const expositionText = exposition.overrideText || getSubjectText(exposition.subject)

  if (!expositionText)
    return null;

  return h('div', { className: styles.expositionDialogueContainer }, [
    h('div', { className: styles.expositionDialogueBox }, h(MarkdownRenderer, { markdownText: expositionText }))
  ])
};

const ExpositionBackground = ({ key, background, assets, anim, expositionAnim }) => {
  if (!background) {
    return null;
  }
  const ref = useRef();

  useTimeSpan(maxSpan([expositionAnim.span, anim.span]), (now) => {
    const { current: element } = ref;
    if (!element)
      return;
    const expositionPoint = calculateCubicBezierAnimationPoint(expositionAnim, now);
    const point = calculateCubicBezierAnimationPoint(anim, now);
    element.style.opacity = Math.min(point.position, expositionPoint.position);
  }, [expositionAnim, anim])
  
  switch (background.type) {
    case 'image':
      const imageAsset = !!background.imageAssetId && assets.get(background.imageAssetId);
      if (!imageAsset) {
        return null;
      }
      return h('div', {
        ref,
        style: {
          position: 'absolute', width: '100%', height: '100%',
          backgroundImage: `url(${imageAsset.downloadURL})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center center'
        }
      });
    case 'color':
      return h('div', { ref, style: { backgroundColor: background.color }});
  }
}
