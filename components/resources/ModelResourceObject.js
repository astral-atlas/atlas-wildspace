// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Ref } from "@lukekaalim/act";
import type { Object3D } from "three";
*/
import { h, useEffect, useRef } from "@lukekaalim/act";
import { orthographicCamera, perspectiveCamera } from "@lukekaalim/act-three";
import {
  Camera,
  Mesh,
  OrthographicCamera,
  PerspectiveCamera,
  CameraHelper,
  Scene,
} from "three";

/*::
export type SerializedObject = [Camera]

export type ModelResourceObjectProps = {
  object: Object3D,
  ref?: ?Ref<?Object3D>,
  parentRef?: ?Ref<?Object3D>,
  showHiddenObjects?: boolean,
};
*/

export const ModelResourceObject/*: Component<ModelResourceObjectProps>*/ = ({
  ref: externalRef,
  object,
  parentRef = null, 
  showHiddenObjects = false,
}) => {
  const internalRef = useRef();
  const ref = externalRef || internalRef;

  const children = object.children.map(object =>
    h(ModelResourceObject, { object, parentRef: ref, showHiddenObjects }));

  const objectProps = {
    ref,
    position: object.position,
    quaternion: object.quaternion,
  }

  if (object instanceof Mesh) {
    const meshProps = {
      ...objectProps,
      geometry: object.geometry,
      material: object.material,
    };
    return h('mesh', meshProps, children)
  }
  if (object instanceof Camera && showHiddenObjects) {
    return h(ModelResourceCamera, { camera: object, objectProps })
  }
  if (object instanceof Scene) {
    return object.children.map(object =>
      h(ModelResourceObject, { object, parentRef, showHiddenObjects }));
  }
  return h('object3d', objectProps, children);
}

const ModelResourceCamera = ({ camera, objectProps }) => {
  const ref = useRef/*:: <?(PerspectiveCamera | OrthographicCamera)>*/();
  useEffect(() => {
    const { current: cameraObject } = ref;
    if (!(cameraObject instanceof Camera))
      return null;
    
    const helper = new CameraHelper( camera );
    cameraObject.add(helper);
    return () => {
      if (helper.parent === cameraObject)
        cameraObject.remove(helper);
    }
  }, [camera])
  if (camera instanceof PerspectiveCamera) {
    const { aspect, near, far, fov, zoom } = camera;
    return h(perspectiveCamera, { ...objectProps, ref, aspect, near, far, fov, zoom })
  }
  if (camera instanceof OrthographicCamera) {
    const { near, far, bottom, left, right, top, zoom } = camera;
    return h(orthographicCamera, { ...objectProps, ref, near, far, bottom, left, right, top, zoom })
  }
  return null;
}