// @flow strict
/*::
import type {
  ModelResource,
  ModelResourceID,
} from "../../../models/game/resources/model";
import type {
  MiniTheaterRenderResources,
} from "../../miniTheater/useMiniTheaterResources";
import type { Object3D } from "three";
*/

/*::
export type EditorData = {
  resources: MiniTheaterRenderResources,

  model: ModelResource,
  object: Object3D,
};
*/

export const useEditorData = (
  modelId/*: ModelResourceID*/,
  resources/*: MiniTheaterRenderResources*/
)/*: EditorData*/ => {
  const model = resources.modelResources.get(modelId);
  if (!model)
    throw new Error();

  const object = resources.objectMap.get(model.assetId);
  if (!object)
    throw new Error();

  return { model, object, resources };
};