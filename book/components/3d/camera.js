// @flow strict
/*:: import type { PreviewPage } from '@astral-atlas/wildspace-components';*/
import { h, useRef, useEffect, useState } from '@lukekaalim/act';
import { C } from "@lukekaalim/act-three";

import { BoxGeometry, Vector3, Euler } from "three"; 

/*::
export type CameraPageProps = {

};
*/

const geometry = new BoxGeometry(1, 1, 1);

export const CameraPage/*: PreviewPage<CameraPageProps>*/ = {
  name: 'Camera',
  defaultWorkplaceProps: {},
  workspace: () => {
    const rootRef = useRef();
    const [camera, setCamera] = useState(null);
    const [position, setPosition] = useState(new Vector3(0, 0, 0));
    const [rotation, setRotation] = useState(new Euler(0, 0, 0));

    useEffect(() => {
      const { current: root } = rootRef;
      if (!root)
        return;
      setCamera(root.camera);
      console.log(root.scene)
    }, []);
    const onClick = () => {
      setRotation(v => new Euler(v.x + (Math.PI * 0.1), v.x, 0));
    };
    useEffect(() => {
      document.addEventListener('click', onClick);
      return () => document.removeEventListener('click', onClick);
    }, [])
    const onRender = () => {};
    return h(C.three, { width: 256, height: 256, ref: rootRef, onRender }, [
      camera && h(C.group, { group: camera }),
      h(C.mesh, { geometry, rotation })
    ])
  },
  workspaceControls: () => {
    return h('p', {}, 'hi')
  }
};