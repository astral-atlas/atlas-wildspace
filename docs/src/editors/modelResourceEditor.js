// @flow strict
/*::
import type { LibraryData } from "../../../models/game/library";
import type { Component } from "@lukekaalim/act";
*/

import { useLibraryMiniTheaterResources } from "../../../components/miniTheater/resources/libraryResources";
import { ModelResourceEditor } from "../../../components/resources/editor/ModelEditor";
import { createMockLibraryData } from "@astral-atlas/wildspace-test";
import { h, useState } from "@lukekaalim/act";

export const ModelResourceEditorDemo/*: Component<>*/ = () => {
  const [library, setLibrary] = useState/*:: <LibraryData>*/(() => createMockLibraryData())

  const resources = useLibraryMiniTheaterResources(library)
  const modelId = null;

  return h(ModelResourceEditor, { modelId, resources });
};
