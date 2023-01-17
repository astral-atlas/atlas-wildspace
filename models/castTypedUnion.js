// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
*/

import { c, castObject } from "@lukekaalim/cast";

export const createTypedUnionCaster = /*:: <T>*/(
  castProperties/*: (type: mixed, object: { +[string]: mixed }) => ?T*/,
  typeProperty/*: string*/ = 'type'
)/*: Cast<T>*/ => {
  const cast = (input) => {
    const object = castObject(input);
    const output = castProperties(object[typeProperty], object);
    if (!output)
      throw new Error();
    return output;
  };
  return cast;
}

export const createTypedUnionCastList = /*:: <T>*/(
  castList/*: [mixed, Cast<T>][]*/,
  prop/*: string*/ = 'type'
)/*: Cast<T>*/ => {
  const castMap = new Map(castList);
  return (v) => {
    const obj = castObject(v);
    const cast = castMap.get(obj[prop]);
    if (!cast)
      throw new Error();

    return cast(v);
  }
}
