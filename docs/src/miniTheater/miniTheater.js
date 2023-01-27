// @flow strict
/*::
import type { Page } from "..";
*/

import { h } from "@lukekaalim/act"
import { WidePage } from "../page"
import { FloorOutlineDemo } from "./floorOutlineDemo"
import { GizmoDemo } from "./gizmoDemo"

import editorOverlayText from './editorOverlay.md?raw';
import { Document } from "@lukekaalim/act-rehersal";
import { Markdown } from "@lukekaalim/act-rehersal/document";
import { MiniTheaterEditorOverlayDemo } from "./editorOverlay";

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'mini_theater_editor_overlay':
      return h(MiniTheaterEditorOverlayDemo);
    default:
      return null;
  }
}

export const miniTheaterEditorOverlayPage/*: Page*/ = {
  link: { children: [], href: '/mini-theater/editor_overlay', name: 'Mini Theater Editor Overlay' },
  content: [
    h(WidePage, {}, [
      h(Document, {}, [
        h(Markdown, { text: editorOverlayText, directives: { demo: Demo } })
      ])
    ])
  ],
}

export const miniTheaterPage/*: Page*/ = {
  link: { children: [
    miniTheaterEditorOverlayPage.link,
  ], href: '/mini-theater', name: 'Mini Theater' },
  content: [
    h(WidePage, {}, [
      h(GizmoDemo),
      h(FloorOutlineDemo)
    ])
  ],
}

export const miniTheaterPages/*: Page[]*/ = [
  miniTheaterPage,
  miniTheaterEditorOverlayPage,
]