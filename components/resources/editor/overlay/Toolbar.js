// @flow strict
/*::
import type { Ref, Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act"

/*::
export type ToolbarProps = {
  cameraButtonRef: Ref<?HTMLElement>
}
*/

export const Toolbar/*: Component<ToolbarProps>*/ = ({ cameraButtonRef }) => {
  return [
    h('button', { ref: cameraButtonRef }, 'Camera')
  ]
}