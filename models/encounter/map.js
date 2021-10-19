// @flow strict
/*:: import type { Cast } from '@lukekaalim/cast'; */
import { c } from '@lukekaalim/cast';

/*::
export type Vector3D = { x: number, y: number, z: number };
*/

export const castVector3D/*: Cast<Vector3D>*/ = c.obj({ x: c.num, y: c.num, z: c.num });