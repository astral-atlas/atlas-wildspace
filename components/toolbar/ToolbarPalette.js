// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Tool } from "./Tool";
*/

import { h } from "@lukekaalim/act"
import classes from './ToolbarPalette.module.css';
import { ToolRenderer } from "./ToolRenderer";

/*::
export type ToolbarPaletteProps = {
  tools: Tool[]
}
*/

export const ToolbarPalette/*: Component<ToolbarPaletteProps>*/ = ({
  tools,
  children
}) => {
  return h('menu', { className: classes.palette }, [
    tools.map(tool =>
      h('li', {}, h(ToolRenderer, { tool }))),
    children
  ])
}