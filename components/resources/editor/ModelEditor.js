// @flow strict
/*::
import type { ModelResourceID } from "../../../models/game/resources/model";
import type { MiniTheaterRenderResources } from "../../miniTheater/useMiniTheaterResources";
import type { Component } from "@lukekaalim/act";
*/
import { FreeCamera } from "../../camera";
import { RenderCanvas } from "../../three";
import { ModelResourceObject } from "../ModelResourceObject";
import { Overlay } from "./Overlay";
import { h, useRef } from "@lukekaalim/act";
import { useEditorData } from "./editorData";
import { ModelPreview } from "./preview/ModelPreview";

/*::
export type ModelResourceEditorProps ={
  resources: MiniTheaterRenderResources,
  modelId: ModelResourceID,
};
*/

export const ModelResourceEditor/*: Component<ModelResourceEditorProps>*/ = ({ resources, modelId }) => {
  const cameraButtonRef = useRef();
  const editorData = useEditorData(modelId, resources);

  return [
    h(Overlay, { cameraButtonRef }),
    h(RenderCanvas, { }, [
      h(FreeCamera, { surfaceRef: cameraButtonRef }),
      h(ModelPreview),
    ]),
  ]
};