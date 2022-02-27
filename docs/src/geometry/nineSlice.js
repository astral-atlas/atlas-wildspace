// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
*/
import throttle from 'lodash.throttle';
import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { mesh, points, useDisposable, useLookAt, useResizingRenderer, useWebGLRenderer } from "@lukekaalim/act-three";
import { scene, perspectiveCamera, group } from "@lukekaalim/act-three";

import {
  BufferAttribute,
  Float32BufferAttribute,
  BufferGeometry,
  WireframeGeometry,
  LineSegments,
  Vector3,
  Vector2,
  MeshBasicMaterial,
} from "three";
import { GridHelperGroup } from "../controls/helpers";
import { useRenderLoopManager } from "../controls/loop";
import styles from '../demo.module.css';

const threshold = (input, limit) => {
  return input <= limit ? 0 : 1;
}

export const writeVertexPositions = (
  [width, height]/*: [number, number]*/,
  borderSize/*: number*/,
  output/*: number[] | Float32Array*/,
) => {
  for (let y = 0; y < 4; y++) {
    for (let x = 0; x < 4; x ++) {
      const i = (x + (y * 4)) * 3;
      const vertexX = ((((x + 1) % 3) - 1) * borderSize) + (threshold(x, 1) * width);
      const vertexY = ((((y + 1) % 3) - 1) * borderSize) + (threshold(y, 1) * height);
      console.log({ vertexX, vertexY, width, height })

      output[i + 0] = vertexX;
      output[i + 1] = 0;
      output[i + 2] = vertexY;
    }
  }
}
export const writeTriangleIndices = (
  output/*: number[] | Uint8Array*/
) => {
  for (let square = 0; square < 9; square++) {
    const i = square * 6;
  
    const topLeft = (square % 3) + (Math.floor(square / 3) * 4);
    const topRight = topLeft + 1;
    const bottomLeft = topLeft + 4;
    const bottomRight = bottomLeft + 1;

    output[i + 0] = bottomLeft;
    output[i + 1] = topRight;
    output[i + 2] = topLeft;

    output[i + 3] = bottomLeft;
    output[i + 4] = bottomRight;
    output[i + 5] = topRight;
  }
}
export const writeUV = (
  output/*: number[] | Float32Array*/
) => {
  for (let i = 0; i < 16; i++) {
    const x = i % 4;
    const y = ((i - x) / 4);

    const v = i * 2;

    output[v + 0] = x / 3;
    output[v + 1] = y / 3;
  }
}

export const createNineSlicedGeometry = ()/*: BufferGeometry*/ => {
  const geometry = new BufferGeometry();
  const vertexCount = 16;
  const triangleCount = 18;
  const positions = new Float32Array(vertexCount * 3);
  const uvs = new Float32Array(vertexCount * 3);
  const triangles = new Uint8Array(triangleCount * 3);

  writeTriangleIndices(triangles);
  writeUV(uvs);

  geometry.setAttribute('position', new BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new BufferAttribute(uvs, 2));
  geometry.setIndex(new BufferAttribute(triangles, 1));
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
      h(perspectiveCamera, { ref: cameraRef, position: new Vector3(0, 16, 4), fov: 26 }),
      h(GridHelperGroup, { interval: 1, size: 10 }),
      children,
    ])
  ];
};

const material = new MeshBasicMaterial();

export const NineSliceDemo/*: Component<>*/ = () => {
  const [x, setX] = useState(0);
  const [y, setY] = useState(0);
  const [b, setB] = useState(1);
  
  const geometry = useDisposable(() => {
    return createNineSlicedGeometry();
  }, []);
  const [geometryVersion, setGeometryVersion] = useState(0);

  useEffect(() => {
    const position = geometry.getAttribute('position');
    writeVertexPositions([1+x, 1+y], b, position.array);
    position.needsUpdate = true;
    setGeometryVersion(position.version);
  }, [x, y, b, geometry]);

  const wireframeGeometry = useDisposable(() => {
    return new WireframeGeometry(geometry);
  }, [geometryVersion]);
  const pointsGeometry = useDisposable(() => {
    const pointsGeometry = new BufferGeometry();
    pointsGeometry.setAttribute('position', geometry.getAttribute('position'));
    return pointsGeometry;
  }, [geometryVersion]);

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
    h('input', { type: 'range', min: 0, max: 10, step: 0.01, value: x, onInput: throttle(e => setX(e.target.valueAsNumber), 100) }),
    h('input', { type: 'range', min: 0, max: 10, step: 0.01, value: y, onInput: throttle(e => setY(e.target.valueAsNumber), 100) }),
    h('input', { type: 'range', min: 0, max: 10, step: 0.01, value: b, onInput: throttle(e => setB(e.target.valueAsNumber), 100) }),
    h(GeometryDemo, {}, [
      //h(mesh, { geometry, material }),
      h(group, { ref: groupRef }),
      h(points, { geometry: pointsGeometry }),
    ])
  ];
};
