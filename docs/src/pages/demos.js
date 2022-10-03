// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
*/
import { FloatingOverlay } from "@astral-atlas/wildspace-components"
import { h } from "@lukekaalim/act"
import { ScaledLayoutDemo } from "../demo"

export const FloatingOverlayDemo/*: Component<>*/ = () => {
  return h(ScaledLayoutDemo, {}, [
    h(FloatingOverlay, {},
      h('p', {}, 'Hello'))
  ])
}