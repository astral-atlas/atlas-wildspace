// @flow strict

import { h } from "@lukekaalim/act";
import { Toolbar } from "./overlay/Toolbar";
import { Sidebar } from "./overlay/Sidebar";

/*::
import type { Component } from "@lukekaalim/act";

export type OverlayProps = {
  
};
*/

export const Overlay/*: Component<OverlayProps>*/ = ({ }) => {
  return h('div', {}, [
    h(Toolbar, {}),
    h(Sidebar),
  ]);
};