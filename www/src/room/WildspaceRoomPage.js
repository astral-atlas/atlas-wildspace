// @flow strict
/*::
import type { WildspaceController, RoomRoute } from "@astral-atlas/wildspace-components";
import type { Component } from "@lukekaalim/act";
import type { CubicBezierAnimation } from "@lukekaalim/act-curve";
import type { UserID } from "@astral-atlas/sesame-models";
*/

import { CompassLayout, CompassLayoutMinimap, GameOverlay, RoomOverlay } from "@astral-atlas/wildspace-components";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { allScreens, useRoomController } from "./useRoomController";
import { RoomControlScreen } from "./screens/RoomControlScreen";
import { RoomLibraryScreen } from "./screens/RoomLibraryScreen";

import styles from './WildspaceRoomPage.module.css';
import { Vector2 } from "three";
import { calculateCubicBezierAnimationPoint, maxSpan, useAnimatedNumber, useTimeSpan } from "@lukekaalim/act-curve";
import { RoomLobbyScreen } from "./screens/RoomLobbyScreen";
import { RoomSceneScreen } from "./screens/RoomSceneScreen";

/*::
export type WildspaceRoomPageProps = {
  userId: UserID,
  loadingAnim: CubicBezierAnimation,
  route: RoomRoute,
  wildspace: WildspaceController,
};
*/

export const WildspaceRoomPage/*: Component<WildspaceRoomPageProps>*/ = ({
  wildspace,
  route,
  userId,
  loadingAnim,
}) => {
  const roomController = useRoomController(wildspace, route, userId);
  if (!roomController)
    return null;
  
  const ref = useRef();

  const [roomLoadAnim] = useAnimatedNumber(roomController ? 1 : 0, 0, { duration: 1000, impulse: 3 })

  const playerScreens = [
    { content: h(RoomSceneScreen, { roomController }), position: new Vector2(0, 0) },
    { content: 'Initiative', position: new Vector2(-1, 0) },
    { content: 'Wiki', position: new Vector2(1, 0) },
    { content: h(RoomLobbyScreen, { roomController }), position: new Vector2(0, 1) },
    { content: 'Toolbox', position: new Vector2(0, -1) },
  ]
  const gmScreens = [
    ...playerScreens,
    ...[
      { content: h(RoomControlScreen, { roomController }), position: new Vector2(-1, -1) },
      { content: h(RoomLibraryScreen, { roomController }), position: new Vector2(-1, 1) },
      { content: 'Something', position: new Vector2(1, -1) },
      { content: 'Something', position: new Vector2(1, 1) },
    ]
  ]
  const screens = roomController.isGM ? gmScreens : playerScreens;

  useTimeSpan(maxSpan([loadingAnim.span, roomLoadAnim.span]), (now) => {
    const { current: div } = ref;
    if (!div)
      return;
    const loadingPoint = calculateCubicBezierAnimationPoint(loadingAnim, now);
    const roomLoadingPoint =  calculateCubicBezierAnimationPoint(roomLoadAnim, now);
    div.style.opacity = Math.min(loadingPoint.position, roomLoadingPoint.position);
  }, [loadingAnim, roomLoadAnim])

  return [
    h('div', { className: styles.room, ref }, [
      h('div', { className: styles.backgroundScene, ref: roomController.roomBackgroundRef }),
      !!roomController && !!screens && h(CompassLayout, { screens, direction: roomController.screenPosition }),
      h(RoomOverlay, {
        name: 'bob',
        sesameURL: new URL(wildspace.config.www.sesame.httpOrigin),
        volume: 0,
        onFullscreenClick: wildspace.toggleFullscreen,
        direction: roomController.screenPosition,
        screens: Object.keys(allScreens),
        screen: route.screen,
        onScreenChange: screen => roomController.router.setRoute({ ...route, screen })
      }),
    ])
  ];
}