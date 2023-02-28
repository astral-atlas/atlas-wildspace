// @flow strict
/*::
import type { ComponentMap } from "@lukekaalim/act-markdown";
*/

import { ResourceModelTreeInputDemo } from "./ResourceModelTreeInput.js";
import { ExpandToggleInputDemo } from "./togglesDemo.js";
import { TreeGraphColumnDemo } from "./TreeGraphColumnDemo.js";
import { ModelResourceEditorSectionDemo } from "./editors.js";
import { PreviewSidebarLayoutDemo } from "./layout.js";

export const directives/*: ComponentMap*/ = {
  TreeGraphColumnDemo: TreeGraphColumnDemo,
  ExpandToggleInputDemo: ExpandToggleInputDemo,
  ResourceModelTreeInputDemo: ResourceModelTreeInputDemo,
  ModelResourceEditorSectionDemo: ModelResourceEditorSectionDemo,
  PreviewSidebarLayoutDemo: PreviewSidebarLayoutDemo
};