// @flow strict
/*::
import type { Page } from "..";
*/

import { h } from "@lukekaalim/act"
import { WidePage } from "../page"
import { FloorOutlineDemo } from "./floorOutlineDemo"
import { GizmoDemo } from "./gizmoDemo"

export const miniTheaterPage/*: Page*/ = {
  link: { children: [], href: '/mini-theater', name: 'Mini Theater' },
  content: [
    h(WidePage, {}, [
      h(GizmoDemo),
      h(FloorOutlineDemo)
    ])
  ],
}

export const miniTheaterPages/*: Page[]*/ = [
  miniTheaterPage,
]