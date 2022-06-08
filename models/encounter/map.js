// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
/*:: import type { StaticModelID } from "../model.js"; */
/*:: import type { GameID } from "../game.js"; */
import { c } from '@lukekaalim/cast';


/*::
export type BoardPosition =  { x: number, y: number, z: number };
export type Vector3D = BoardPosition;

export type Euler3D = { x: number, y: number, z: number, order: ?string };
*/

export const castBoardPosition/*: Cast<BoardPosition>*/ = c.obj({ x: c.num, y: c.num, z: c.num });
export const castVector3D = castBoardPosition;

export const castEuler3D/*: Cast<Euler3D>*/ = c.obj({ x: c.num, y: c.num, z: c.num, order: c.maybe(c.str) });

export const isBoardPositionEqual = (a/*: Vector3D*/, b/*: Vector3D*/)/*: boolean*/ => (
  a.x === b.x && 
  a.y === b.y && 
  a.z === b.z
)
export const isVector3DEqual = isBoardPositionEqual;

/*::
export type PropID = string;
export type Prop = {
  id: PropID,
  name: string,

  staticModelID: StaticModelID,
  position: Vector3D,
  rotation: Euler3D,
  visible: boolean,
};
*/

/*::
export type DioramaID = string;
export type Diorama = {
  gameId: GameID,
  id: DioramaID,
  name: string,

  props: $ReadOnlyArray<Prop>,
};
*/