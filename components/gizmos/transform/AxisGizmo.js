// @flow strict
/*::
import type { Component, Ref } from "@lukekaalim/act";
import type { BufferGeometry, Vector3 } from "three";

import type { RaycastManager } from "../../raycast/manager";
import type { LoopController } from "../../three/useLoopController";
*/
import { h, useContext, useEffect, useRef, useState } from "@lukekaalim/act";
import { mesh, useDisposable } from "@lukekaalim/act-three";
import { useRaycast2 } from "../../raycast/manager";
import { renderCanvasContext } from "../../three";
import { MeshBasicMaterial, Vector2 } from "three";

/*::
export type AxisGizmoProps = {
  geometry: BufferGeometry,
  raycast: RaycastManager,
  loop?: ?LoopController,
  canvasRef?: ?Ref<?HTMLCanvasElement>,

  position?: Vector3,

  onAxisMove?: (delta: Vector2) => mixed,
};
*/

export const AxisGizmo/*: Component<AxisGizmoProps>*/ = ({
  geometry,
  raycast,
  loop,
  canvasRef,

  position,
  onAxisMove,
}) => {
  const ref = useRef();
  const render = useContext(renderCanvasContext);
  if (!render)
    return null;

  const usedLoop = loop || render.loop;
  
  const [dragOffset, setDragOffset] = useState(null);
  const [highlight, setHighlight] = useState(false)

  useRaycast2(raycast, ref, {
    enter() {
      setHighlight(true);
    },
    exit() {
      setHighlight(false)
    },
  }, []);

  const material = useDisposable(() => {
    return new MeshBasicMaterial();
  }, []);
  useEffect(() => {
    const { current: canvas } = canvasRef || render.canvasRef;
    if (!canvas)
      return;
    if (highlight || dragOffset) {
      canvas.style.cursor = 'pointer';
      material.color.set('yellow')
    }
    else {
      canvas.style.cursor = 'auto';
      material.color.set('white')
    }
  }, [highlight, dragOffset])

  useEffect(() => {
    const { current: canvas } = canvasRef || render.canvasRef;
    if (!canvas)
      return;

    const onPointerDown = (e/*: PointerEvent*/) => {
      const currentIntersectionObject = raycast.lastIntersectionRef.current?.object;
      if (currentIntersectionObject && currentIntersectionObject === ref.current) {
        canvas.requestPointerLock();
        setDragOffset(new Vector2(0, 0));
      }
    };
    const onPointerUp = (e/*: PointerEvent*/) => {
      document.exitPointerLock();
      setDragOffset(null)
    }
    const onPointerMove = (e/*: PointerEvent*/) => {
      if (dragOffset)
        onAxisMove && onAxisMove(new Vector2(e.movementX, e.movementY))
    };
    const onPointerOver = (e/*: PointerEvent*/) => {

    };
    const unsubscribeLoop = usedLoop.subscribeSimulate(() => {
      const interection = raycast.lastIntersectionRef.current;
    })
    canvas.addEventListener('pointerdown', onPointerDown);
    canvas.addEventListener('pointerup', onPointerUp);
    canvas.addEventListener('pointerover', onPointerOver);
    canvas.addEventListener('pointermove', onPointerMove);
    return () => {
      unsubscribeLoop();
      canvas.removeEventListener('pointerdown', onPointerDown);
      canvas.removeEventListener('pointerup', onPointerUp);
      canvas.removeEventListener('pointerover', onPointerOver);
      canvas.removeEventListener('pointermove', onPointerMove);
    }
  }, [usedLoop, dragOffset, raycast, onAxisMove])

  return h(mesh, {
    name: 'Axis',
    geometry,
    ref,
    material,
    position
  })
};
