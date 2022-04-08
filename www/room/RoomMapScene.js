// @flow strict
/*:: import type { Component } from '@lukekaalim/act'; */
/*:: import type { EncounterState, Mini, MiniID, EncounterAction } from "@astral-atlas/wildspace-models"; */
import { h, useEffect, useMemo, useRef, useState } from '@lukekaalim/act';
import { C } from '@lukekaalim/act-three';
import {  } from '@lukekaalim/act-curve';
import throttle from 'lodash.throttle';
import icon from '../public/2d/unknown_icon.png'
import battlemap_src from '../public/2d/battlemap_island_4.png';

import {
  BoxGeometry,
  Mesh,
  MeshBasicMaterial,
  GridHelper,
  Euler,
  DoubleSide,
  Color,
  Raycaster,
  PlaneGeometry,
  WireframeGeometry,
  LineSegments,
  Sprite,
  SpriteMaterial,
  TextureLoader,
  Vector3,
  Quaternion,
  Vector2,
} from "three";
import * as async from "../hooks/async";
import { useAsync } from "../hooks/async";

const mat = new MeshBasicMaterial({ color: 'red' })
const mesh = new GridHelper(100, 10, new Color('red'), new Color('white'));

/*::
export type MapSceneProps = {
  width: number,
  height: number,
  zoom: number,
  encounter: EncounterState,
  mapViewRef: { current: ?HTMLElement },
  selectedMinis: MiniID[],
  setSelectedMinis: MiniID[] => mixed,
  onSubmitActions: EncounterAction[] => mixed,
  miniImageURLMap: { [MiniID]: ?string },
};
*/
export const MapScene/*: Component<MapSceneProps>*/ = ({
  height, width, zoom, encounter, mapViewRef, setSelectedMinis, selectedMinis,
  onSubmitActions, miniImageURLMap,
}) => {
  const rootRef = useRef();
  const pivotRef = useRef();
  const minisRef = useRef();

  const mouseRef = useRef(new Vector2(0, 0))
  const viewOffsetRef = useRef(new Vector2(0, 0))
  const panningRef = useRef(false);
  const cursorPositionRef = useRef(new Vector2(0, 0));
  const raycaster = useMemo(() => new Raycaster(), [])

  const [camera, setCamera] = useState(null)
  const [angle, setAngle] = useState/*:: <number>*/(0)
  useEffect(() => {
    const { current: root } = rootRef;
    if (!root)
      return;
    setCamera(root.camera)
    root.camera.position.set(0, 0, 0);
  }, [])

  const grid = useMemo(() => new GridHelper(100, 100, new Color('red')), []);

  useEffect(() => {
    const { current: root } = rootRef;
    const { current: mapView } = mapViewRef;
    const { current: cursorPosition } = cursorPositionRef;
    const { current: pivot } = pivotRef;

    if (!root || !mapView || !pivot)
      return;
    const onKeyDown = (event/*: KeyboardEvent*/) => {
      switch (event.code) {      
        case 'Space':
          event.preventDefault();
          mapView.requestPointerLock();
          return panningRef.current = true;
      }
    };
    const onKeyUp = (event/*: KeyboardEvent*/) => {
      if (panningRef.current) {
        switch (event.code) {
          case 'Space':
            event.preventDefault();
            document.exitPointerLock();
            return panningRef.current = false;
          case 'ArrowLeft':
            return pivot.translateX(-4);
          case 'ArrowRight':
            return pivot.translateX(4);
          case 'ArrowUp':
            return pivot.translateZ(-4);
          case 'ArrowDown':
            return pivot.translateZ(4);
        }
      }
      switch (event.code) {
        case 'Space':
          event.preventDefault(); 
          document.exitPointerLock();
          return panningRef.current = false;
        case 'ArrowLeft':
          return setAngle(r => r + 1);
        case 'ArrowRight':
          return setAngle(r => r - 1);
      }
    }
    const onMouseMove = (e/*: PointerEvent*/) => {
      if (panningRef.current && pivotRef.current) {
        pivotRef.current.translateX(e.movementX * -0.03);
        pivotRef.current.translateZ(e.movementY * -0.03);
        return;
      }
      var rect = ((e/*: any*/).currentTarget/*: HTMLElement*/).getBoundingClientRect();
      var x = e.clientX - rect.left;
      var y = e.clientY - rect.top;
      mouseRef.current.x = ( x / rect.width ) * 2 - 1;
      mouseRef.current.y = - ( y / rect.height ) * 2 + 1;
    };
    const onMouseDown = (e/*: MouseEvent*/) => {
      mapView.focus();
      e.preventDefault();
      const cursorPosition = cursorPositionRef.current;
      const minisInSquare = encounter.minis.filter(m => m.position.x === cursorPosition.x && m.position.z === cursorPosition.y);
      if (e.button === 0) {
        if (e.shiftKey)
          setSelectedMinis([...new Set([ ...selectedMinis, ...minisInSquare.map(m => m.id) ])]);
        else
          setSelectedMinis([...minisInSquare.map(m => m.id)]);
      } else if (e.button == 1) {
        mapView.requestPointerLock();
        panningRef.current = true;
      } else if (e.button == 2) {
        
      }
    };
    const onMouseUp = (e/*: MouseEvent*/) => {
      switch (e.button) {
        case 1:
          panningRef.current = false;
          document.exitPointerLock();
          return;
        case 2:
          if (selectedMinis.length > 0) {
            const newPosition = { x: cursorPosition.x, y: 0, z: cursorPosition.y };
            return onSubmitActions(selectedMinis.map(miniId => ({ type: 'move', miniId, newPosition })))
          }
          return;
      }
    }
    const onContextMenu = (e/*: MouseEvent*/) => e.preventDefault();
    mapView.addEventListener('pointermove', onMouseMove, false );
    mapView.addEventListener('mousedown', onMouseDown, false );
    mapView.addEventListener('mouseup', onMouseUp, false );

    mapView.addEventListener('contextmenu', onContextMenu);

    document.addEventListener('keydown', onKeyDown);
    document.addEventListener('keyup', onKeyUp);
    return () => {
      mapView.removeEventListener('pointermove', onMouseMove, false);
      mapView.removeEventListener('mousedown', onMouseDown, false);
      mapView.removeEventListener('mouseup', onMouseUp, false);

      mapView.removeEventListener('contextmenu', onContextMenu);

      document.removeEventListener('keydown', onKeyDown);
      document.removeEventListener('keyup', onKeyUp);
    }
  }, [selectedMinis, encounter]);

  const cameraPosition = new Vector3(0, 10, 10);
  const cameraRotation = new Euler(Math.PI / -4, 0, 0);

  useCurves({ angle }, ({ angle }) => {
    const { current: pivot } = pivotRef;
    if (!pivot)
      return;
    pivot.rotation.copy(new Euler(0, (Math.PI / 4) * -(angle + 0.5), 0));
  });
  useCurves({ zoom }, ({ zoom }) => {
    const { current: root } = rootRef;
    if (!root)
      return;
    root.camera.zoom = zoom;
    root.camera.updateProjectionMatrix()
  }, { duration: 250 })

  const cursor = useMemo(() => {
    const geo = new WireframeGeometry(new BoxGeometry(1, 1, 1));
    const line = new LineSegments(geo, mat)
    return line;
  }, [])
  const cursorPlane = useMemo(() => {
    const material = new MeshBasicMaterial( {color: 0xffff00, side: DoubleSide} );
    const geo = new PlaneGeometry(100, 100);
    geo.rotateX(Math.PI * 0.5);
    const plane = new Mesh(geo, material);
    window.plane = plane;
    return plane;
  }, [])
  
  const onRender = throttle(() => {
    const { current: root } = rootRef;
    const { current: cursorPosition } = cursorPositionRef;
    if (!root)
      return;
    
    raycaster.setFromCamera(mouseRef.current, root.camera);
    const intersects = raycaster.intersectObject(cursorPlane, true);
    
    const first = intersects[0]
    if (first && !panningRef.current) {
      cursorPosition.x = Math.round(first.point.x- 0.5);
      cursorPosition.y = Math.round(first.point.z- 0.5);
      cursor.position.set(cursorPosition.x + 0.5, 0.5, cursorPosition.y + 0.5);
    }
  }, 20);

  return [
    h(C.three, { height, width, ref: rootRef, onRender }, [
      h(C.group, { group: cursor }),
      h(C.group, { ref: pivotRef }, [
        h(C.group, { group: camera, position: cameraPosition, rotation: cameraRotation })
      ]),
      h(BattlePlane, {}),

      h(C.group, { group: grid }),
      h(C.group, { ref: minisRef }, [
      ...encounter.minis.map(mini => h(MiniModel, { mini, key: mini.id, miniImageURLMap }))
      ])
    ])
  ]
};

const BattlePlane = ({ }) => {
  const [details] = useAsync(async () => {
    const texture = await new Promise((resolve, reject) => new TextureLoader().load(battlemap_src, resolve, console.log, reject));
    const mat = new MeshBasicMaterial({ map: texture });
    console.log(mat);
    const geo = new PlaneGeometry(40, 30);
    geo.rotateX(Math.PI * - 0.5);
    return { mat, geo };
  }, [])

  return [
    details && h(C.mesh, { geometry: details.geo, material: details.mat }) || null,
  ];
};

const MiniModel = ({ mini, key, miniImageURLMap }) => {
  const miniRef = useRef();

  useCurves({ x: mini.position.x, y: mini.position.y, z: mini.position.z }, ({ x, y, z }) => {
    const { current: mesh } = miniRef;
    if (!mesh)
      return;
    mesh.position.set(x + 0.5, y + 0.5, z+0.5);
  }, { duration: 250 })

  const [sprite] = useAsync(async () => {
    const url = miniImageURLMap[mini.id] || icon;
    if (!url)
      return;
    const map = await new Promise((resolve, reject) => new TextureLoader().load(url, resolve, console.log, reject));
    const material = new SpriteMaterial({ map });
    const sprite = new Sprite(material);
    return sprite;
  }, [mini, miniImageURLMap])

  return sprite && h(C.group, { ref: miniRef, name: mini.id, group: sprite }) || null;
};