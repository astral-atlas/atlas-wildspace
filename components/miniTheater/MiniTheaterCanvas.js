// @flow strict

/*::
import type { Component } from "@lukekaalim/act";
import type { MiniTheater, Board, Character, MonsterActorMask, BoardPosition } from "@astral-atlas/wildspace-models";
import type { MiniTheaterController } from "./useMiniTheaterController";
import type { AssetDownloadURLMap } from "../asset/map";
import type { EncounterResources } from "../encounter/useResources";
import type { KeyboardStateEmitter } from "../keyboard/changes";
*/

import { h} from "@lukekaalim/act";
import {
  PCFSoftShadowMap,
  Color,
} from "three";

import { useRenderSetup } from "../three/useRenderSetup";
import { MiniTheaterScene } from "./MiniTheaterScene";
import classes from './MiniTheaterCanvas.module.css';

/*::
export type MiniTheaterCanvasProps = {
  controller: MiniTheaterController,
  miniTheater: MiniTheater,

  characters: $ReadOnlyArray<Character>,
  monsters: $ReadOnlyArray<MonsterActorMask>,
  assets: AssetDownloadURLMap,

  emitter?: KeyboardStateEmitter,

  resources: EncounterResources,
}
*/

export const MiniTheaterCanvas/*: Component<MiniTheaterCanvasProps>*/ = ({
  controller,
  miniTheater,
  characters,
  monsters,
  assets,
  resources,
  emitter,
  children,
}) => {
  const render = useRenderSetup({}, ({ renderer }) => {
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFSoftShadowMap;
  });

  return [
    h('canvas', { ref: render.canvasRef, tabIndex: 0, className: classes.miniTheaterCanvas }),
    h('scene', { ref: render.sceneRef, background: new Color('black') }, [
      children,
      h(MiniTheaterScene, { controller, miniTheater, render, resources, characters, assets, monsters, emitter })
    ])
  ]
}