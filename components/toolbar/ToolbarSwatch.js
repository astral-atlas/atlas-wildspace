// @flow strict

/*::
import type { Component } from "@lukekaalim/act";
import type { SwatchTool, Tool } from "./Tool";
*/

import { h } from "@lukekaalim/act"
import styles from './ToolbarSwatch.module.css';
import { ToolRenderer } from "./ToolRenderer";

/*::
export type ToolbarSwatchProps = {
  tool: SwatchTool,
};
*/

export const ToolbarSwatch/*: Component<ToolbarSwatchProps>*/ = ({ tool }) => {
  return h('div', { className: styles.toolbarSwatch }, [
    h('button', { className: styles.toolbarSwatchAction }, [
      !!tool.iconURL && h('img', { src: tool.iconURL }),
      !!tool.title && h('span', {}, tool.title),
    ]),
    h('div', { className: styles.swatchHoverContainer }, [
      h('ul', { className: styles.toolbarSwatchList }, [
        tool.tools.map(tool => h('li', {}, h(ToolRenderer, { tool })))
      ])
    ]),
  ])
}
