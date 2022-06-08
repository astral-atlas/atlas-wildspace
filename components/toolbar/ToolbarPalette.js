// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act"
import classes from './ToolbarPalette.module.css';

/*::
export type ToolbarPaletteProps = {
  tools: {
    onClick: () => mixed,
    iconURL: string,
  }[]
}
*/

export const ToolbarPalette/*: Component<ToolbarPaletteProps>*/ = ({
  tools
}) => {
  return h('menu', { className: classes.palette }, tools.map(tool =>
    h('li', {},
      h('button', { onClick: tool.onClick },
        h('img', { src: tool.iconURL })))))
}