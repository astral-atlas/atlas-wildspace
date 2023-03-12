// @flow strict
/*::
import type { ComponentMap } from "@lukekaalim/act-markdown";
*/

import { ResourceModelObjectInputDemo, ResourceModelTreeInputDemo } from "./ResourceModelTreeInput.js";
import { ExpandToggleInputDemo } from "./togglesDemo.js";
import { TreeGraphColumnDemo } from "./TreeGraphColumnDemo.js";
import { ModelResourceEditorSectionDemo } from "./editors.js";
import { PreviewSidebarLayoutDemo, ResourceMetaLayoutDemo } from "./layout.js";
import { TextInputDemo } from "./form.js";

// $FlowFixMe
const modules = import.meta.glob(`./smart/**/*.directive.js`, { eager: true });

// $FlowFixMe
const smartDirectives/*: ComponentMap*/ = Object.fromEntries(
  Object.values(modules)
    // $FlowFixMe
    .map(module => Object.entries(module))
    .flat(1)
);

export const directives/*: ComponentMap*/ = {
  ...smartDirectives,
  TreeGraphColumnDemo: TreeGraphColumnDemo,
  ExpandToggleInputDemo: ExpandToggleInputDemo,
  ResourceModelTreeInputDemo: ResourceModelTreeInputDemo,
  ModelResourceEditorSectionDemo: ModelResourceEditorSectionDemo,
  PreviewSidebarLayoutDemo: PreviewSidebarLayoutDemo,
  ResourceModelObjectInputDemo: ResourceModelObjectInputDemo,
  ResourceMetaLayoutDemo: ResourceMetaLayoutDemo,

  TextInputDemo: TextInputDemo,
};