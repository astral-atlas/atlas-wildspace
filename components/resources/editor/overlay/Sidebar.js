// @flow strict

import { Details } from "./Details";
import { Tree } from "./Tree";
import { h } from "@lukekaalim/act"

export const Sidebar = () => {
  return [
    h(Tree),
    h(Details),
  ]
}