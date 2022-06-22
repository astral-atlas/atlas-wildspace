// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Tool } from "./Tool";
*/
import { ToolbarSwatch } from "./ToolbarSwatch";
import { h } from "@lukekaalim/act";
import styles from './ToolRenderer.module.css';

/*::
export type ToolRendererProps = {
  tool: Tool
}
*/
export const ToolRenderer/*: Component<ToolRendererProps>*/ = ({ tool }) => {
  switch (tool.type) {
    case 'action':
      return h('button', { disabled: tool.disabled, onClick: tool.onAction, className: styles.actionTool }, [
        !!tool.iconURL && h('img', { src: tool.iconURL }),
        tool.title && h('span', {}, tool.title),
      ]);
    case 'swatch':
      return h(ToolbarSwatch, { tool });
  }
};