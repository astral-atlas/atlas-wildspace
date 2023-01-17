// @flow strict
/*::
import type { Cast } from "@lukekaalim/cast";
*/

export const spreadCast = /*:: <A, B>*/(
  castA/*: Cast<A>*/,
  castB/*: Cast<B>*/,
)/*: Cast<{ ...A, ...B }>*/ => {
  const caster = (v) => {
    return {
      ...castA(v),
      ...castB(v),
    };
  };
  return caster;
}