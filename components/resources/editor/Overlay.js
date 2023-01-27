// @flow strict

import { h } from "@lukekaalim/act";
import { Toolbar } from "./overlay/Toolbar";
import { Sidebar } from "./overlay/Sidebar";
import { MiniTheaterOverlay } from "../../miniTheater/MiniTheaterOverlay";

/*::
import type { Component, Ref } from "@lukekaalim/act";

export type OverlayProps = {
  cameraButtonRef: Ref<?HTMLElement>
};
*/

export const Overlay/*: Component<OverlayProps>*/ = ({ cameraButtonRef }) => {
  return h('div', {}, [
    h(Toolbar, { cameraButtonRef }),
    h(Sidebar),
  ]);
};