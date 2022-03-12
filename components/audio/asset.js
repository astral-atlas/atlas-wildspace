// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
import { h } from "@lukekaalim/act";

/*::
export type AssetGridProps = {

};
*/


export const AssetGrid/*: Component<AssetGridProps>*/ = ({ children }) => {

  return h('ul', { }, [
    children
      .map(child => h('il', {}, child))
  ]);
};