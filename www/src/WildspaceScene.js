// @flow strict
/*::
import type { RoomController } from "./room/useRoomController";
import type { MiniTheater, MiniTheaterID } from "@astral-atlas/wildspace-models";
import type { Component, Ref } from "@lukekaalim/act";
*/

import { MiniTheaterCanvas, ToolbarPalette, useMiniTheaterController, useResourcesLoader } from "@astral-atlas/wildspace-components";
import { useKeyboardStateEmitterMiddleware } from "@astral-atlas/wildspace-components/keyboard/middleware";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";

import styles from './WildspaceScene.module.css';

/*::
export type WildspaceSceneProps = {
  roomController: RoomController,
  attachementRef: Ref<?HTMLElement>
};
*/

export const WildspaceScene/*: Component<WildspaceSceneProps>*/ = ({ roomController, attachementRef }) => {
  const { gamePage, roomPage } = roomController
  const { scene } = roomPage;

  const content = scene && scene.content || { type: 'none' };

  switch (content.type) {
    case 'mini-theater':
      return h(WildspaceMiniTheaterScene, {
        attachementRef,
        roomController,
        miniTheaterId: content.miniTheaterId
      })
    default:
      return null;
  }

};

/*::
export type WildspaceMiniTheaterSceneProps = {
  miniTheaterId: MiniTheaterID,
  roomController: RoomController,
  attachementRef: Ref<?HTMLElement>
};
*/

export const WildspaceMiniTheaterScene/*: Component<WildspaceMiniTheaterSceneProps>*/ = ({
  miniTheaterId,
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
    console.log({attachement})
    if (!attachement || !background)
      return null;

    attachement.appendChild(background);
    return () => {
      attachement.removeChild(background);
    }
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
  console.log('TOOL USE')

  const tools = [
    ...characters
      .filter(c => c.playerId === userId)
      .map(c => ({
        onClick: onCharacterToolClick(c),
        iconURL: c.initiativeIconAssetId && assets.get(c.initiativeIconAssetId)?.downloadURL || ''
      })),
    ...isGM ? [
      ...monsterMasks
        .map(mm => ({
          onClick: onMonsterToolClick(mm),
          iconURL: mm.initiativeIconAssetId && assets.get(mm.initiativeIconAssetId)?.downloadURL || ''
        })),
      ...['box'].map(terrainType => ({
        onClick: onTerrainToolClick(terrainType),
        iconURL: ''
      }))
    ] : []
  ];

  const onBlur = () => {
    console.log('lol!')
  }
  const onFocus = () => {

  }

  useEffect(() => {
    const { current: screen } = screenRef;
    const { current: background } = backgroundRef;
    if (!screen || !background)
      return;

    let activeElement = document.activeElement;
    const onFocusIn = (event/*: FocusEvent*/) => {
      activeElement = event.target
      console.log(activeElement);
    };
    const onFocusOut  = (event/*: FocusEvent*/) => {
      activeElement = null
      console.log(activeElement);
    }
    background.addEventListener('focusin', onFocusIn);
    background.addEventListener('focusout', onFocusOut);
    const observer = new MutationObserver(records => {
      console.log('MUTATION')
      const removed = new Set(records.map(r => [...r.removedNodes]).flat(1));
      console.log(removed.has(activeElement))
      console.log(document.activeElement)
      if (removed.has(activeElement)) {
        screen.focus();
        activeElement = null
        console.log(activeElement);
      }
    })
    observer.observe(background, { childList: true, subtree: true })
  }, [])

  return [
    h('div', { ref: screenRef, className: styles.sceneScreen, tabIndex: 0 }, [
      h('div', { class: 'sceneBottom' }, h(ToolbarPalette, { tools })),
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
        controlSurfaceElementRef: screenRef
      })
    ])),
  ]
}