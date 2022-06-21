// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
*/

import { ScaledLayoutDemo } from "../demo";
import { h } from "@lukekaalim/act"
import { SideOverlay } from "@astral-atlas/wildspace-components";

export const SideOverlayDemo/*: Component<>*/ = () => {
  return h(ScaledLayoutDemo, {}, [
    h(SideOverlay, {}, 'Demo Content')
  ])
}