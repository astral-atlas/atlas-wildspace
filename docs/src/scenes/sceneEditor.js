// @flow strict
/*::
import type { Page } from "..";
import type { Component } from "@lukekaalim/act";
*/

import { WidePage } from "../page";
import { SceneContentEditor } from "@astral-atlas/wildspace-components"
import { h, useState } from "@lukekaalim/act"
import { Document } from "@lukekaalim/act-rehersal";
import { ScaledLayoutDemo } from "../demo";

export const SceneEditorDemo/*: Component<>*/ = () => {
  const initialContent = {
    type: 'none'
  };
  const [content, setContent] = useState(initialContent);
  const onContentUpdate = (nextContent) => {
    setContent(nextContent);
  };
  return h(SceneContentEditor, { content, onContentUpdate });
}

export const sceneEditorPage/*: Page*/ = {
  content:
    h(WidePage, {},
      h(ScaledLayoutDemo, {},
        h(SceneEditorDemo))),
  link: {
    name: 'Scene Editor',
    href: '/scenes/editor',
    children: [],
  }
}