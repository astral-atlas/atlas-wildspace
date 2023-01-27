// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { MiniTheaterEditorOverlay } from "@astral-atlas/wildspace-components/overlay";
import { h } from "@lukekaalim/act";
import { ScaledLayoutDemo } from "../demo";


const FlexFiller = ({ color, children }) =>
  h('div', { style: { backgroundColor: color, flex: 1 } }, children);

export const MiniTheaterEditorOverlayDemo/*: Component<>*/ = () => {
  return [
    h(ScaledLayoutDemo, {}, [
      h(MiniTheaterEditorOverlay, {
        sidebar: h(FlexFiller, { color: 'blue' }, 'Sidebar'),
        toolbar: h(FlexFiller, { color: 'red' }, 'Toolbar'),
      })
    ])
  ]
};