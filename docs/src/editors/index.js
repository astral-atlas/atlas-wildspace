// @flow strict
/*:: import type { Page } from "@lukekaalim/act-rehersal"; */

import { h } from "@lukekaalim/act";
import { Document, Markdown } from "@lukekaalim/act-rehersal";
import { EditorFormDemo, FileEditorDemo, TextEditorDemo } from "./demos";

import editorsText from './index.md?raw';
import richText from './richText.md?raw';
import modelResourceEditorText from './modelResourceEditor.md?raw';

import { ListEditorDemo } from "./list";
import { ProseMirrorDemo } from "./richTextDemo.js";
import { ModelResourceEditorDemo } from "./modelResourceEditor";
import { TreeEditorDemo } from "./TreeEditorDemo";

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'text_editor':
      return h(TextEditorDemo);
    case 'file_editor':
      return h(FileEditorDemo)
    case 'editor_form':
      return h(EditorFormDemo);
    case 'list_editor':
      return h(ListEditorDemo);
    case 'prose_mirror':
      return h(ProseMirrorDemo);
    case 'model_resource_editor':
      return h(ModelResourceEditorDemo);
    case 'tree_editor':
      return h(TreeEditorDemo)
    default:
      throw new Error();
  }
};

const directives = {
  demo: Demo,
}

const modelEditorPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: modelResourceEditorText, directives })),
  link: { children: [], name: 'Model Resource Editor', href: '/editors/model-resource' }
};

export const richTextEditor/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: richText, directives })),
  link: { children: [

  ], name: 'Rich Text', href: '/editors/rich-text' }
}
export const editorsPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: editorsText, directives })),
  link: { children: [
    richTextEditor.link,
    modelEditorPage.link,
  ], name: 'Editors', href: '/editors' }
}


export const editorsPages/*: Page[]*/ = [
  editorsPage,
  richTextEditor,
  modelEditorPage,
];