// @flow strict
/*:: import type { Component } from "@lukekaalim/act"; */
/*:: import type { MiniID } from "@astral-atlas/wildspace-models"; */
/*:: import type { Quaternion, Material } from "three"; */
/*:: import type { RaycastManager } from "../raycast"; */

import { createContext, h, useContext, useEffect, useRef, useState } from "@lukekaalim/act";
import { raycastManagerContext, useRaycast, useRaycast2, useRaycastManager } from "../raycast";
import {
  BoxGeometry,
  BufferGeometry,
  PlaneGeometry,
  Vector3,
  TextureLoader,
  BufferAttribute,
  LineBasicMaterial,
  SpriteMaterial,
  Color,
  Vector2,
  NearestFilter,
  MeshBasicMaterial,
} from "three";
import * as THREE from 'three';
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader";
import { lineSegments, mesh, sprite } from "@lukekaalim/act-three";
import { maxSpan, useAnimatedNumber, useAnimation, useBezierAnimation, useTimeSpan } from "@lukekaalim/act-curve";
import { useDisposable } from "@lukekaalim/act-three";

import targetIconURL from './target_icon.png';
import board_grid_tilemap from '../../geometry/board_grid_tilemap.png';
import {
  calculateBezier2DPoint,
  useAnimatedVector2,
} from "../../pages/layouts";
import { calculateCubicBezierAnimationPoint } from "@lukekaalim/act-curve/bezier";
import { Tilemap, TilemapTile2DTexture } from "@astral-atlas/wildspace-components";


/*::
export type BoardVector = [number, number, number];

export type BoardPieceID = string;
export type BoardPiece = {
  area: BoardArea,
  pieceId: BoardPieceID,
};

export type BoardID = string;
export type Board = {
  id: BoardID,
  height: number,
  width: number,

  pieces: BoardPiece[],
};

export type BoxBoardArea = {
  type: 'box',
  origin: BoardVector,
  width: number,
  height: number,
  depth: number,
};
export type CylinderBoardArea = {
  type: 'cylinder',
  origin: BoardVector,
  radius: number,
  height: number,
}

export type BoardArea =
  | BoxBoardArea
  | CylinderBoardArea
*/

const planeGeo = new PlaneGeometry(10, 10, 1, 1);
const cubeGeo = new BoxGeometry(10, 2, 10, 1, 1, 1).translate(0, 1, 0);

const defaultGeometry = new BufferGeometry();

const useGeometry = (geometryCreator, deps) => {
  const [geometry, setGeometry] = useState(defaultGeometry);
  useEffect(() => {
    const geo = geometryCreator();
    setGeometry(geo);

    return () => {
      geo.dispose();
    }
  }, deps)
  return geometry;
};

const CharacterMiniRenderer = ({ position, mini, focused, selected }) => {
  const ref = useRef();
  const material = useDisposable(() => {
    return new SpriteMaterial({ map: mini.texture })
  }, [mini])

  const [focusAnimation] = useAnimatedNumber(focused ? 1 : 0, 0, { duration: 200, impulse: 3 });
  const [selectedAnimation] = useAnimatedNumber(selected ? 1 : 0, 0, { duration: 200, impulse: 3 });
  const animatedPosition = useAnimatedVector2([position.x, position.z], [position.x, position.z], 30, 600)
  const animatedPositionSlow = useAnimatedVector2([position.x, position.z], [position.x, position.z], 0, 600)

  const max = maxSpan([focusAnimation.span, animatedPosition.max, selectedAnimation.span]);

  useTimeSpan(max, (now) => {
    const { current: characterSprite } = ref;
    if (!characterSprite)
      return;

    const positionPoint = calculateBezier2DPoint(animatedPosition, now);
    const positionSlowPoint = calculateBezier2DPoint(animatedPositionSlow, now);
    const focusPoint = calculateCubicBezierAnimationPoint(focusAnimation, now);
    const selectedPoint = calculateCubicBezierAnimationPoint(selectedAnimation, now);

    material.opacity = 0.5 + (selectedPoint.position/2);

    const velocity =  Math.sqrt(Math.pow(positionSlowPoint.velocity[0], 2) + Math.pow(positionSlowPoint.velocity[1], 2));

    characterSprite.position.set(
      positionPoint.position[0],
      position.y + (focusPoint.position * 1.5) + (selectedPoint.position) + (Math.min(velocity * 0.1, 2)),
      positionPoint.position[1],
    );
  }, [max, animatedPosition, focusAnimation])

  return h(sprite, {
    ref,
    scale: new Vector3(10, 10, 10),
    material: material,
    center: new Vector2(0.5, 0.5),
    position,
  });
};

const targetTexture = new TextureLoader().load(targetIconURL);

const characterMinis = new Map([
  ['mini_1', { texture: targetTexture }]
])

const pieceVisuals = new Map([
  ['cool', { type: 'character_mini', miniId: 'mini_1' }],
  ['hot', { type: 'character_mini', miniId: 'mini_1' }],
])

const PieceRenderer = ({ piece: { pieceId, area: { origin } }, focused, selected }) => {

  const position = new Vector3((origin[0] * 10) + 5, (origin[2] * 10) + 5, (origin[1] * 10) + 5);
  const visual = pieceVisuals.get('cool');
  if (!visual)
    return h(mesh, { geometry: cubeGeo, position });

  switch (visual.type) {
    case 'character_mini':
      const mini = characterMinis.get(visual.miniId);
      if (!mini)
        throw new Error();
      return h(CharacterMiniRenderer, { position, mini, focused, selected })
    default:
      throw new Error(`Unknown visual type`);
  }
}

const pointIntersectsBoxShape = (point, boxArea) => {
  const lowerBounds = [
    boxArea.origin[0] - Math.floor(boxArea.width / 2),
    boxArea.origin[1] - Math.floor(boxArea.height / 2),
    boxArea.origin[2] - Math.floor(boxArea.depth / 2),
  ]
  const upperBounds = [
    boxArea.origin[0] + Math.floor(boxArea.width / 2),
    boxArea.origin[1] + Math.floor(boxArea.height / 2),
    boxArea.origin[2] + Math.floor(boxArea.depth / 2),
  ]
  const pointAboveLowerBounds = (
    point[0] >= lowerBounds[0] &&
    point[1] >= lowerBounds[1] &&
    point[2] >= lowerBounds[2]
  )
  const pointBelowUpperBounds = (
    point[0] <= upperBounds[0] &&
    point[1] <= upperBounds[1] &&
    point[2] <= upperBounds[2]
  )
  return pointAboveLowerBounds && pointBelowUpperBounds;
}

const pointIntersectsShape = (point, area) => {
  switch (area.type) {
    case 'box':
      return pointIntersectsBoxShape(point, area)
    default:
      throw new Error();
  }
}

/*::
export type BoardInterfaceProps = {|
  raycaster: RaycastManager,
  board: Board,

  onBoardClick?: (piece: ?BoardPiece) => mixed,
|};
*/

export const BoardInterface/*: Component<BoardInterfaceProps>*/ = ({
  raycaster, board: { height, width, pieces },
  onBoardClick
}) => {
  const planeRef = useRef();
  const planeGeo = useGeometry(
    () => new PlaneGeometry(10 * width, 10 * height, 1, 1).rotateX(Math.PI*-0.5),
    [height, width]
  );
  
  const cubeRef = useRef();
  const [isFocused, setIsFocused] = useState(false);
  const [focusedPiece, setFocusedPiece] = useState(null);
  const focusRef = useRef([0, 0, 0]);

  useRaycast2(raycaster, planeRef, {
    enter() {
      setIsFocused(true);
    },
    exit() {
      setIsFocused(false);
    },
  });

  useAnimation(() => {
    if (!isFocused)
      return;
    const { current: intersection } = raycaster.lastIntersectionRef;
    const { current: cube } = cubeRef;
    const { current: plane } = planeRef;
    if (!intersection || !cube || !plane)
      return;
    const localIntersection = plane.worldToLocal(intersection.point);

    const focus = [Math.floor(localIntersection.x / 10), Math.floor(localIntersection.z / 10), 0]
    focusRef.current = focus;
    cube.position.set((focus[0] * 10) + 5, focus[2], (focus[1] * 10) + 5)

    const nextFocusedPiece = pieces.find(piece => {
      return pointIntersectsShape(focus, piece.area);
    });
    if (nextFocusedPiece !== focusedPiece)
      setFocusedPiece(nextFocusedPiece);
    // local space is scaled
    //cube.position.setY(cube.position.y + 5)
  }, [isFocused, raycaster, focusedPiece])
  
  return [
    h(mesh, { ref: planeRef, geometry: planeGeo, visible: false }),
    h(mesh, { ref: cubeRef, geometry: cubeGeo, visible: isFocused }),
    ...pieces.map(piece => h(PieceRenderer, { piece, focused: focusedPiece && focusedPiece.pieceId === piece.pieceId }))
  ];
};

const useBoardGeometry = (board/*: Board*/) => {
  const width = 10 * board.width;
  const height = 10 * board.height;

  const geometry = useGeometry(
    () => new PlaneGeometry(width, height, 1, 1).rotateX(Math.PI*-0.5),
    [height, width]
  );

  return geometry;
}

const writeGridLines = (array, widthSegments, heightSegments) => {
  const width = widthSegments * 10;
  const height = heightSegments * 10;

  for (let y = 0; y < heightSegments + 1; y++) {
      const i = (y * 6);

      array[i + 0] = 0;
      array[i + 1] = 0;
      array[i + 2] = y * 10;

      array[i + 3] = width
      array[i + 4] = 0;
      array[i + 5] = y * 10;
  }
  for (let x = 0; x < heightSegments + 1; x++) {
      const i = (x * 6) + ((heightSegments + 1) * 6)

      array[i + 0] = x * 10;
      array[i + 1] = 0;
      array[i + 2] = 0;

      array[i + 3] = x * 10
      array[i + 4] = 0;
      array[i + 5] = height;
  }
}

const useGridGeometry = (width, height) => {
  return useDisposable(() => {
    const positions = new Float32Array(((width + 1) * 6) + (height + 1) * 6);

    writeGridLines(positions, width, height)
    const geometry = new BufferGeometry();
    geometry.setAttribute('position', new BufferAttribute(positions, 3));
    geometry.translate(-width * 5, 0, -height * 5);

    return geometry;
  }, [width, height])
}

const tilesTexture = new TextureLoader().load(board_grid_tilemap);
tilesTexture.minFilter = THREE.LinearFilter;
const tileSize = new Vector2(8, 8);
const redColor = new Color('red')

const BoardLineGrid = ({ board }) => {
  const mapTexture = useDisposable(() => {
    const data = new Uint8Array(Array.from({ length: board.width * board.height }).map(_ => 0));
    return new TilemapTile2DTexture(data, new Vector2(board.width, board.height));
  }, [board.width, board.height]);

  return h(Tilemap, {
    mapTexture, tileSize, tilesTexture,
    color: redColor, opacity: 0.9,
    position: new Vector3(0, 0, 0),
    scale: new Vector3(10, 10, 10)
  });
}

const localVectorToBoardPosition = (localVector/*: Vector3*/)/*: [number, number, number]*/ => [
  Math.floor(localVector.x / 10),
  Math.floor(localVector.z / 10),
  0,
];

const BoardRenderer = ({ board }) => {
  const geometry = useBoardGeometry(board);

  const { onBoardClick, focus, selection, useBoardCollisionRef } = useContext(encounterContext);
  const [internalRef, ref] = useBoardCollisionRef(board);

  const [focused, setFocused] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(new Vector3(0, 0, 0));

  useRaycast(internalRef, {
    enter() {
      setFocused(true);
    },
    over(intersection) {
      const localVector = intersection.object.worldToLocal(intersection.point);
      const position = localVectorToBoardPosition(localVector);
      setCursorPosition(new Vector3((position[0] * 10) + 5, (position[2]  *10) + 0.5, (position[1] * 10) + 5));
    },
    exit(e) {
      setFocused(false);
    },
    click: (intersection) => {
      const localPoint = intersection.object.worldToLocal(intersection.point);
  
      const position = localVectorToBoardPosition(localPoint);
      onBoardClick(board, position);
    }
  }, [board, onBoardClick])

  return [
    h(mesh, { visible: false, geometry, ref }),
    h(BoardLineGrid, { board }),
    board.pieces.map(piece => h(PieceRenderer, {
      piece,
      focused: focus === piece.pieceId || selection === piece.pieceId,
      selected: selection === piece.pieceId
    })),
    focused && h(BoardCursor, { position: cursorPosition }),
  ];
};

const boardCursorGeometry = new PlaneGeometry(10, 10).rotateX(Math.PI * -0.5);
const boardCursorMaterial = new MeshBasicMaterial({ color: new Color(`white`), transparent: true, opacity: 0.5 });
const BoardCursor = ({ position }) => {
  return h(mesh, { geometry: boardCursorGeometry, material: boardCursorMaterial, position });
}

const encounterContext = createContext({
  focus: null,
  selection: null,
  useBoardCollisionRef: (_) => { throw new Error(); },
  onBoardClick: (_, __) => { throw new Error() },
});

/*::
type EncounterProps = {
  board: Board,
};
*/
export const Encounter/*: Component<EncounterProps>*/ = ({
  board,
  subscribeAuxClick = _ => {},
  movePiece = _ => {},
}) => {
  const [focus, setFocus] = useState(null);
  const [selection, setSelection] = useState([]);

  const [boardByCollisionObject] = useState(new Map());

  const encounterValue = {
    focus,
    selection,
    useBoardCollisionRef(board) {
      const internalRef = useRef()
      const sharedRef = (boardCollisionObject) => {
        internalRef.current = boardCollisionObject;
        if (boardCollisionObject) {
          boardByCollisionObject.set(boardCollisionObject, board);
        } else {
          const previousObjectEntry = [...boardByCollisionObject.entries()].find(([, b]) => b.id === board.id)
          if (previousObjectEntry)
            boardByCollisionObject.delete(previousObjectEntry[0]);
        }
      }
      return [internalRef, sharedRef];
    },
    onBoardClick(board, position) {
      const nextFocusedPiece = board.pieces.find(piece => {
        return pointIntersectsShape(position, piece.area);
      });
      if (nextFocusedPiece)
        setSelection(nextFocusedPiece.pieceId)
      else
        setSelection(null)
    }
  }
  const raycast = useContext(raycastManagerContext);
  useEffect(() => raycast && subscribeAuxClick(() => {
    const intersection = raycast.lastIntersectionRef.current;
    if (!intersection)
      return;
    //const board = boardByCollisionObject.get(intersection.object);
    if (!board)
      return;
    const localVector = intersection.object.worldToLocal(intersection.point);
    const position = localVectorToBoardPosition(localVector);
    movePiece(board, selection, position);
  }), [raycast, selection])

  useAnimation(raycast && (() => {
    const intersection = raycast.lastIntersectionRef.current;
    if (!intersection)
      return;
    //const board = boardByCollisionObject.get(intersection.object);
    if (!board)
      return;
    const localVector = intersection.object.worldToLocal(intersection.point);
    const position = localVectorToBoardPosition(localVector);
    const nextFocusedPiece = board.pieces.find(piece => {
      return pointIntersectsShape(position, piece.area);
    });
    if (focus !== nextFocusedPiece)
      setFocus(nextFocusedPiece ? nextFocusedPiece.pieceId : null);
  }), [focus, board]);

  return [
    h(encounterContext.Provider, { value: encounterValue }, [
      h(BoardRenderer, { board })
    ]),
  ];
}