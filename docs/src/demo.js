// @flow strict
/*:: import type { Component, Ref } from '@lukekaalim/act'; */
/*:: import type { SceneProps } from '@lukekaalim/act-three'; */
/*::
import type { RaycastManager } from "./controls/raycast";
*/
/*:: import type { PerspectiveCamera, Scene, Vector2 } from "three"; */
/*:: import type { LoopContextValue, OnLoop } from "./controls/loop"; */

import { h, useRef, useEffect, useState } from "@lukekaalim/act";
import { perspectiveCamera, scene, useLookAt, useResizingRenderer, useWebGLRenderer } from "@lukekaalim/act-three";
import { GridHelperGroup } from "./controls/helpers";
import { useRenderLoopManager } from "./controls/loop";
import styles from './demo.module.css';
import { Vector3 } from "three";
import { raycastManagerContext, useRaycastManager } from "./controls/raycast";
import { EditorForm, EditorRangeInput, rootStyles } from "@astral-atlas/wildspace-components";
import {
  EditorButton,
  EditorHorizontalSection,
} from "../../components/editor/form";

const useAnimationContext = (canvasRef, sceneRef, cameraRef, webgl) => {
  const [onLoop, loopContext] = useRenderLoopManager()

  useEffect(() => {
    const { current: canvas } = canvasRef;
    const { current: scene } = sceneRef;
    const { current: camera } = cameraRef;
    if (!canvas || !scene || !camera || !webgl)
      return;

    const renderVars = {
      delta: 0,
      now: performance.now(),
    }
    const renderConsts = {
      canvas,
      scene,
      camera,
      renderer: webgl
    }
    const onFrame = (now) => {
      renderVars.delta = now - renderVars.now;
      renderVars.now = now;

      onLoop(renderConsts, renderVars);

      id = requestAnimationFrame(onFrame);
    }
    let id = requestAnimationFrame(onFrame);
    return () => {
      cancelAnimationFrame(id);
    }
  }, [webgl]);

  useEffect(() => loopContext.subscribeRender((renderConsts) => {
    renderConsts.renderer.render(renderConsts.scene, renderConsts.camera);
  }), [])

  return loopContext;
}

export const useResizingCamera = (size/*: ?Vector2*/, cameraRef/*: Ref<?PerspectiveCamera>*/) => {
  useEffect(() => {
    const { current: camera } = cameraRef;
    if (!camera || !size)
      return;
    
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix()
  }, [size])
}


export const useDemoSetup = ()/*: { canvasRef: Ref<?HTMLCanvasElement>, cameraRef: Ref<?PerspectiveCamera>, sceneRef: Ref<?Scene>, loop: LoopContextValue }*/ => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();

  const webgl = useWebGLRenderer(canvasRef);
  const size = useResizingRenderer(canvasRef, webgl);
  useResizingCamera(size, cameraRef)
  const loop = useAnimationContext(canvasRef, sceneRef, cameraRef, webgl);

  return { canvasRef, cameraRef, sceneRef, loop };
}

/*::
export type GeometryDemoProps = {
  sceneProps?: SceneProps,
  canvasProps?: { [string]: mixed },
  raycastManager?: RaycastManager,
  showGrid?: boolean,
  simulate?: OnLoop,
}
*/

export const GeometryDemo/*: Component<GeometryDemoProps>*/ = ({
  children,
  showGrid = true,
  raycastManager,
  sceneProps,
  canvasProps,
  simulate,
}) => {
  const { canvasRef, cameraRef, sceneRef, loop } = useDemoSetup();
  const localRaycast = useRaycastManager();
  const raycast = raycastManager || localRaycast;

  useLookAt(cameraRef, new Vector3(0, 0, 0), []);
  useEffect(() => {
    return loop.subscribeInput((loopConsts) => raycast.onUpdate(loopConsts.camera));
  }, [loop, raycast.onUpdate])
  useEffect(() => {
    if (simulate)
      return loop.subscribeSimulate(simulate);
  }, [loop, simulate])

  useEffect(() => {
    const { current: canvas } = canvasRef;
    if (!canvas) return;
    canvas.addEventListener('click', raycast.onClick);
    canvas.addEventListener('mouseenter', raycast.onMouseEnter);
    canvas.addEventListener('mousemove', raycast.onMouseMove);
    canvas.addEventListener('mouseleave', raycast.onMouseLeave);
    return () => {
      canvas.removeEventListener('click', raycast.onClick);
      canvas.removeEventListener('mouseenter', raycast.onMouseEnter);
      canvas.removeEventListener('mousemove', raycast.onMouseMove);
      canvas.removeEventListener('mouseleave', raycast.onMouseLeave);
    }
  }, [raycast])

  return [
    h('canvas', { ...canvasProps, ref: canvasRef, class: styles.bigDemoCanvas }),
    h(scene, { ...sceneProps, ref: sceneRef }, [
      h(raycastManagerContext.Provider, { value: raycast }, [
        children,
      ]),
      h(perspectiveCamera, { ref: cameraRef, position: new Vector3(-16, 16, -16), fov: 16 }),
      showGrid && h(GridHelperGroup, { interval: 10, size: 10 }),
    ])
  ];
};

/*::
export type DOMDemoProps = {

};
*/

export const DOMDemo/*: Component<DOMDemoProps>*/ = () => {
  return h('div', {}, [
    
  ])
}


export const LayoutDemo/*: Component<{ style?: {}, height?: string }>*/ = ({ children, style, height = '512px' }) => {
  return h('div', {
    style: { position: 'relative', width: '100%', height, overflow: 'auto' },
    classList: [rootStyles.root]
  }, [
    h('div', {  style: {
      ...style,
      position: 'relative',
      width: '100%', height: '100%',
      maxWidth: '100%', maxHeight: '100%',
      border: '1px solid black', boxSizing: 'border-box',
      resize: 'both', overflow: 'hidden'
    } }, [
      children
    ]),
  ])
}

export const ScaledLayoutDemo/*: Component<{ style?: {}, height?: string }>*/ = ({ children, style, height }) => {
  const [scale, setScale] = useState(1);
  const ref = useRef();
  const onSetFullscreen = () => {
    const { current: element } = ref;
    if (element instanceof HTMLElement)
      element.requestFullscreen();
  }
  return [
    h(LayoutDemo, { style, height }, [
      h('div', { ref, style: {
        ...style,
        transformOrigin: '0 0',
        transform: `scale(${scale})`,
        width: `${100/scale}%`,
        height: `${100/scale}%`,
      } }, children)
    ]),
    h('div', { style: { backgroundColor: '#e8e8e8' } }, [
      h(EditorForm, {}, [
        h(EditorHorizontalSection, {}, [
          h(EditorButton, { label: 'Fullscreen', onButtonClick: onSetFullscreen }),
          h(EditorRangeInput, {
            label: 'Scale', min: 0.1,
            step: 0.001,
            max: 1, number: scale,
            onNumberInput: scale => setScale(scale) })
        ]),
      ])
    ])
  ]
}

export const FullSizeLayoutDemo/*: Component<>*/ = ({ children }) => {
  return h(ScaledLayoutDemo, {}, children)
}
