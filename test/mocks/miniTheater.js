// @flow strict
/*::
import type { EditingLayerID } from "../../models/game/miniTheater/editingLayer";
import type {
  MiniQuaternion,
  MiniVector,
} from "../../models/game/miniTheater/primitives";
import type { MiniTheaterShape } from "../../models/game/miniTheater/shape";
import type {
  TerrainPlacement,
  TerrainProp,
  TerrainPropID,
} from "../../models/game/miniTheater/terrain";
import type { ModelResourceID } from "../../models/game/resources";
import type { CharacterID, Character, Monster, MiniTheater, MonsterActorID, Piece, BoardPosition } from "@astral-atlas/wildspace-models";
*/
import { randomGameName, repeat } from "./random";
import { randomIntRange } from "./random.js";
import { Quaternion } from "three";
import { v4 as uuid } from 'uuid';

export const createMockMiniTheater = (
  pieces/*: Piece[]*/ = [],
  terrain/*: TerrainPlacement[]*/ = [],
)/*: MiniTheater*/ => ({
  id: uuid(),
  name: randomGameName(),
  version: uuid(),
  
  baseArea: { position: { x: 0, y: 0, z: 0}, size: { x: 10, y: 10, z: 1 } },
  pieces,
  layers: [],
  terrain,
});

export const createMockMonsterPiece = (monsterActorId/*: MonsterActorID*/)/*: Piece*/ => ({
  id: uuid(),
  visible: true,
  position: createMockPosition(),
  layer: uuid(),
  represents: {
    type: 'monster',
    monsterActorId,
  },
})
export const createMockCharacterPiece = (characterId/*: CharacterID*/)/*: Piece*/ => ({
  id: uuid(),
  visible: true,
  position: createMockPosition(),
  layer: uuid(),
  represents: {
    type: 'character',
    characterId,
  },
})
export const createMockTerrainPlacement = (
  terrainPropId/*: TerrainPropID*/ = uuid(),
  layer/*: ?EditingLayerID*/ = null,
  position/*: ?MiniVector*/ = null,
  quaternion/*: ?MiniQuaternion*/ = null,
)/*: TerrainPlacement*/ => ({
  id: uuid(),
  visible: true,
  position: position || { x: randomIntRange(40, -40), y: randomIntRange(0, 0), z: randomIntRange(40, -40) },
  quaternion: quaternion || createMockMiniQuaternion(),
  terrainPropId,
  layer: layer || uuid()
})
export const createMockMiniQuaternion = ()/*: MiniQuaternion*/ => {
  const q = new Quaternion().random();
  return { x: q.x, y: q.y, z: q.z, w: q.w };
}
export const createMockTerrainProp = (
  modelResourceId/*: ModelResourceID*/ = uuid(),
  modelPath/*: string[]*/ = [],
  floorShapes/*: ?MiniTheaterShape[]*/ = null,
  name/*: ?string*/ = null,
)/*: TerrainProp*/ => ({
  id: uuid(),
  iconPreviewCameraModelPath: [],
  modelPath,
  modelResourceId,
  name: name || 'Test Terrain',
  floorShapes: floorShapes || repeat(() => createMockShape(), 2),
})
export const createMockShape = ()/*: MiniTheaterShape*/ => ({
  type: 'box',
  position: createMockPosition(),
  rotation: { x: 0, y: 0, z: 0, w: 1 },
  size: { x: randomIntRange(30, 10), y: 10, z: randomIntRange(30, 10) }
})


export const createMockPosition = ()/*: BoardPosition*/ => ({
  x: randomIntRange(10, -10),
  y: randomIntRange(10, -10),
  z: 0,
})