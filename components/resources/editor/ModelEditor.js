// @flow strict
/*::
import type { ModelResourceID } from "../../../models/game/resources/model";
import type { MiniTheaterRenderResources } from "../../miniTheater/useMiniTheaterResources";
import type { Component } from "@lukekaalim/act";
*/
import { createDefaultCameraPosition, FreeCamera } from "../../camera";
import { RenderCanvas, useLoopController } from "../../three";
import { ModelResourceObject } from "../ModelResourceObject";
import { Overlay } from "./Overlay";
import { h, useRef } from "@lukekaalim/act";
import { useEditorData } from "./editorData";
import { ModelPreview } from "./preview/ModelPreview";
import { GridHelperGroup } from "../../../docs/src/controls/helpers";
import { useElementKeyboard, useKeyboardTrack } from "../../keyboard";
import styles from './ModelEditor.module.css';

/*::
export type ModelResourceEditorProps ={
  resources: MiniTheaterRenderResources,
  modelId: ModelResourceID,
};
*/

const defaultCameraPosition = createDefaultCameraPosition(10)

export const ModelResourceEditor/*: Component<ModelResourceEditorProps>*/ = ({ resources, modelId }) => {
  const cameraButtonRef = useRef();
  const editor = useEditorData(modelId, resources);

  const loop = useLoopController();
  const canvasRef = useRef();

  const emitter = useElementKeyboard(cameraButtonRef);
  const keys = useKeyboardTrack(emitter);

  return [
    h(Overlay, { cameraButtonRef }),
    h(RenderCanvas, {
      className: styles.preview,
      renderSetupOverrides: { keyboardEmitter: emitter, canvasRef, loop },
    }, [
      h(FreeCamera, { surfaceRef: cameraButtonRef, keys, ...defaultCameraPosition }),
      h(ModelPreview, { editor }),
      h(GridHelperGroup, { size: 10, interval: 10 })
    ]),
  ]
};