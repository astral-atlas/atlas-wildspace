// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { CubicBezierAnimation } from "@lukekaalim/act-curve";
import type { UserID } from "@astral-atlas/sesame-models";
import type { GameRoute, WildspaceController } from "@astral-atlas/wildspace-components";
*/

import { Color, Vector2 } from "three";

import { h, useRef } from "@lukekaalim/act";
import {
  useAnimatedNumber,  maxSpan,
  useTimeSpan, calculateCubicBezierAnimationPoint
} from "@lukekaalim/act-curve";
import { perspectiveCamera, scene } from "@lukekaalim/act-three";

import { CompassLayout, GameOverlay, useRenderSetup, WildspaceStarfieldScene } from "@astral-atlas/wildspace-components";

import { useGameController } from "../WildspaceGame";
import { PrepMenu } from "./GamePrep";
import { GameMenu } from "./GameMenu";
import styles from './GamePage.module.css';


/*::

export type WildspaceGameProps = {
  userId: UserID,
  loadingAnim: CubicBezierAnimation,
  route: GameRoute,
  wildspace: WildspaceController,
};
*/
export const WildspaceGamePage/*: Component<WildspaceGameProps>*/ = ({
  userId,
  route,
  loadingAnim,
  wildspace
}) => {
  const ref = useRef();
  const gameController = useGameController(route, wildspace, userId);

  if (!gameController)
    return null;

  const directions = {
    '/': new Vector2(0, 0),
    '/prep': new Vector2(1, 0),
  };
  const direction = directions[route.path];

  const render = useRenderSetup()
  const [gameLoadingAnim] = useAnimatedNumber(!!gameController ? 1 : 0, 0, { impulse: 3, duration: 1000 });

  useTimeSpan(maxSpan([loadingAnim.span, gameLoadingAnim.span]), (now) => {
    const { current: div } = ref;
    if (!div)
      return;
    const gamePoint = calculateCubicBezierAnimationPoint(gameLoadingAnim, now);
    const appPoint = calculateCubicBezierAnimationPoint(loadingAnim, now);

    const max = Math.min(gamePoint.position, appPoint.position);
    div.style.opacity = max;
  }, [loadingAnim, gameLoadingAnim]);

  const player = gameController.gamePage.players.find(p => p.userId === gameController.userId);
  console.log(gameController.gamePage.roomConnectionCounts);

  return [
    h('div', { ref, className: styles.transitionContainer  }, [
      h('canvas', { ref: render.canvasRef, className: styles.menuCanvas }),
      h(scene, { ref: render.sceneRef, background: new Color('black') }, [
        h(WildspaceStarfieldScene),
        h(perspectiveCamera, { ref: render.cameraRef })
      ]),
      h(CompassLayout, { direction, screens: [
        {
          position: new Vector2(0, 0),
          content: h(GameMenu, { gameController })
        },
        {
          position: new Vector2(1, 0),
          content: h(PrepMenu, { gameController })
        },
      ] }),
      h(GameOverlay, {
        name: player && player.name,
        sesameURL: new URL('/', 'http://example.com'),
        onFullscreenClick: wildspace.toggleFullscreen
      }),
    ]),
  ];
}