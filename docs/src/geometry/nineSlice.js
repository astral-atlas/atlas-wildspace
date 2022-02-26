// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
*/
import throttle from 'lodash.throttle';
import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { mesh, useDisposable, useLookAt, useResizingRenderer, useWebGLRenderer } from "@lukekaalim/act-three";
import { scene, perspectiveCamera, group } from "@lukekaalim/act-three";

import {
  BufferAttribute,
  BufferGeometry,
  WireframeGeometry,
  LineSegments,
  Vector3,
  Vector2,
} from "three";
import { GridHelperGroup } from "../controls/helpers";
import { useRenderLoopManager } from "../controls/loop";
import styles from '../demo.module.css';

const threshold = (input, limit) => {
  return input < limit ? 0 : 1
}

const calculateNineSliceVertex = (vertex, position, scale) => {
  const weight = vertex < 2 ? 0 : 1;
  return position + (scale * weight);
};

const calculateInfluence = (vertex, position, scale) => {
  return [
    calculateNineSliceVertex(vertex, position, scale),
    calculateNineSliceVertex(vertex + 1, position + 1, scale),
  ];
}

export const createNineSlicedGeometry = (size/*: [number, number]*/)/*: BufferGeometry*/ => {
  const positions = [];

  for (let y = 0; y < 3; y++) {
    for (let x = 0; x < 3; x ++) {
      const [right, left] = calculateInfluence(x, x, size[0]);
      const [bottom, top] = calculateInfluence(y, y, size[1]);

      const topLeft =     [left, 0, top];
      const topRight =    [right, 0, top];
      const bottomLeft =  [left, 0, bottom];
      const bottomRight = [right, 0, bottom];

      positions.push(topLeft, topRight, bottomLeft);
      positions.push(topRight, bottomRight, bottomLeft);
    }
  }

  const geometry = new BufferGeometry();
  
  geometry.setAttribute('position', new BufferAttribute(new Float32Array(positions.flat(1)), 3));

  return geometry;
};

const useResizingCamera = (size, cameraRef) => {
  useEffect(() => {
    const { current: camera } = cameraRef;
    if (!camera || !size)
      return;
    
    camera.aspect = size.width / size.height;
    camera.updateProjectionMatrix()
  }, [size])
}

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

const useDemoSetup = () => {
  const canvasRef = useRef();
  const cameraRef = useRef();
  const sceneRef = useRef();

  const webgl = useWebGLRenderer(canvasRef);
  const size = useResizingRenderer(canvasRef, webgl);
  useResizingCamera(size, cameraRef)
  useAnimationContext(canvasRef, sceneRef, cameraRef, webgl);

  return { canvasRef, cameraRef, sceneRef };
}

const GeometryDemo = ({ children }) => {
  const { canvasRef, cameraRef, sceneRef } = useDemoSetup();

  useLookAt(cameraRef, new Vector3(0, 0, 0), []);

  return [
    h('canvas', { ref: canvasRef, class: styles.demoCanvas }),
    h(scene, { ref: sceneRef }, [
      h(perspectiveCamera, { ref: cameraRef, position: new Vector3(0, 16, 4), fov: 20 }),
      h(GridHelperGroup, { interval: 1, size: 10 }),
      children,
    ])
  ];
};

export const NineSliceDemo/*: Component<>*/ = () => {
  const [x, setX] = useState(50);
  const [y, setY] = useState(50);
  const geometry = useDisposable(() => {
    return createNineSlicedGeometry([x*10/100, y*10/100])
  }, [x, y]);
  const wireframeGeometry = useDisposable(() => {
    return new WireframeGeometry(geometry);
  }, [geometry]);

  const groupRef = useRef();

  useEffect(() => {
    const { current: group } = groupRef;
    if (!group)
      return;
    
    const line = new LineSegments(wireframeGeometry);
    group.add(line);
    return () => {
      group.remove(line);
    };
  }, [wireframeGeometry]);

  return [
    h('input', { type: 'range', min: 0, max: 100, value: x, onInput: throttle(e => setX(e.target.valueAsNumber), 100) }),
    h('input', { type: 'range', min: 0, max: 100, value: y, onInput: throttle(e => setY(e.target.valueAsNumber), 100) }),
    h(GeometryDemo, {}, [
      h(group, { ref: groupRef})
    ])
  ];
};
