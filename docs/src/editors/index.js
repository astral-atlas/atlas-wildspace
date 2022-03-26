// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */

import { h } from "@lukekaalim/act";
import { Document, Markdown } from "@lukekaalim/act-rehersal";
import { EditorFormDemo, FileEditorDemo, TextEditorDemo } from "./demos";

import editorsText from './index.md?raw';

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'text_editor':
      return h(TextEditorDemo);
    case 'file_editor':
      return h(FileEditorDemo)
    case 'editor_form':
      return h(EditorFormDemo);
    default:
      throw new Error();
  }
};

const directives = {
  demo: Demo,
}

export const editorsPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: editorsText, directives })),
  link: { children: [

  ], name: 'Editors', href: '/editors' }
}

export const editorsPages/*: Page[]*/ = [
  editorsPage,
];