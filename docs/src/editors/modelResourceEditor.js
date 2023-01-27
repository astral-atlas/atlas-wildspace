// @flow strict
/*::
import type { LibraryData } from "../../../models/game/library";
import type { Component } from "@lukekaalim/act";
*/

import { useLibraryMiniTheaterResources } from "../../../components/miniTheater/resources/libraryResources";
import { ModelResourceEditor } from "../../../components/resources/editor/ModelEditor";
import { createMockImageAsset, createMockLibraryData, createMockModelResource } from "@astral-atlas/wildspace-test";
import { h, useState } from "@lukekaalim/act";

import { v4 as uuid } from "uuid";
import { testModelURLs } from "@astral-atlas/wildspace-test/models";
import { ScaledLayoutDemo } from "../demo";

export const ModelResourceEditorDemo/*: Component<>*/ = () => {
  const [modelId] = useState(uuid())

  const [library, setLibrary] = useState/*:: <LibraryData>*/(() => {
    const defaultLib = createMockLibraryData();
    const assetId = uuid();

    return {
      ...defaultLib,
      assets: [
        {
          description: {
            id: assetId,
            MIMEType: 'model/gltf-binary',
            bytes: 0,
            creator: 'CREATOR',
            name: 'Test Model',
            uploaded: Date.now(),
          },
          downloadURL: testModelURLs.stoneDungeon,
        }
      ],
      modelResources: [
        { ...createMockModelResource(), assetId, id: modelId },
      ]
    }
  })

  const resources = useLibraryMiniTheaterResources(library)

  return [
    h(ScaledLayoutDemo, {}, [
      h(ModelResourceEditor, { modelId, resources })
    ])
  ];
};
