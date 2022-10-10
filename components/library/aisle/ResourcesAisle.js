// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { LibraryData, Monster, MonsterActor, Game, ModelResourceID } from "@astral-atlas/wildspace-models";
import type { AssetDownloadURLMap } from "../../asset/map";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
*/

import { h, useEffect, useMemo, useRef, useState } from "@lukekaalim/act";
import debounce from "lodash.debounce";
import { LibraryAisle } from "../LibraryAisle";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { LibraryShelf } from "../LibraryShelf";
import { useLibrarySelection } from "../librarySelection";
import {
  EditorButton,
  EditorForm,
  EditorHorizontalSection,
  EditorNumberInput,
  EditorTextInput,
  EditorVerticalSection,
  FilesButtonEditor,
  SelectEditor,
} from "../../editor/form";
import { useSelection } from "../../editor/selection";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { Camera, PerspectiveCamera, WebGLRenderer } from "three";
import { useRenderSetup } from "../../three/useRenderSetup";
import { PopupOverlay } from "../../layout/PopupOverlay";
import { ModelResourceExplorerCanvas } from "../../resources/ModelResourceExplorerCanvas";
import {
  useModelResourceAssetMap,
} from "../../resources/useModelResourceAssetMap";
import { useModelResourceAssetsIconURL } from "../../resources/useModelResourceAssetsIconURL";

/*::
export type ResourcesAisleProps = {
  game: Game,
  assets: AssetDownloadURLMap,
  client: WildspaceClient,
  library: LibraryData,
}
*/

export const ResourcesAisle/*: Component<ResourcesAisleProps>*/ = ({
  game,
  assets,
  client,
  library
}) => {
  const selection = useLibrarySelection();

  const [modelAssets, loader] = useModelResourceAssetMap(library.modelResources, assets);
  const modelAssetPathMap = useMemo(() => {
    return new Map([...modelAssets]
      .map(([id, m]) => [id, {
        asset: m.asset,
        path: m.model.previewCameraPath
      }]))
  }, [modelAssets])
  const modelIconMap = useModelResourceAssetsIconURL(modelAssetPathMap);

  const modelBooks = library.modelResources.map(r => ({
    title: r.name,
    id: r.id,
    coverURL: modelIconMap.get(r.id)?.previewIconURL
  }))

  const onAddModel = async () => {
    if (!stagingFile || !stagingName)
      return;
    const asset = await client.asset.create(
      `resource/model/${stagingName}`,
      stagingFile.type,
      new Uint8Array(await stagingFile.arrayBuffer())
    );
    await client.game.resources.models.create(game.id, {
      assetId: asset.description.id,
      format: 'gltf',
      name: stagingName,
      previewCameraPath: stagingPath.split('.'),
    })
  };
  const onDeleteModel = async (modelToDelete) => {
    await client.game.resources.models.destroy(game.id, modelToDelete.id);
  }
  const onUpdateModel = async (prevModel, { name, previewCameraPath }) => {
    const update = {
      name: name || prevModel.name,
      previewCameraPath: (previewCameraPath && previewCameraPath.split('.')) || prevModel.previewCameraPath
    };
    await client.game.resources.models.update(game.id, prevModel.id, update);
  }
  const [showExplorer, setShowExplorer] = useState(false);

  const [stagingFile, setStagingFile] = useState/*:: <?File>*/(null)
  const [stagingName, setStagingName] = useState('Untitled Model')
  const [stagingPath, setStagingPath] = useState('');

  const selectedModel = library.modelResources.find(m => selection.selected.has(m.id))
  const explorerModelAsset = selectedModel && modelAssets.get(selectedModel.id);

  return [
    h(LibraryAisle, {
      wideDesk: true,
      floor: [
        h(LibraryFloorHeader, { title: 'Resources' }, [
          h(EditorForm, {}, [
            h(EditorHorizontalSection, {}, [
              h(FilesButtonEditor, { label: 'GLTF File', accept: '.gltf,.glb', onFilesChange: f => setStagingFile(f[0]) }),
              h(EditorTextInput, { label: 'Name', onTextInput: t => setStagingName(t), text: stagingName }),
              h(EditorTextInput, { label: 'Path to preview camera (. seperated)', onTextInput: t => setStagingPath(t) }),
              h(EditorButton, { label: 'Upload', onButtonClick: onAddModel, disabled: !(stagingFile && stagingName) }),
            ])
          ])
        ]),
        h(LibraryShelf, { title: 'Models', selection, books: modelBooks })
      ], desk: [
        !!selectedModel && [
          h(EditorTextInput, { disabled: true, label: 'Model Resource ID', text: selectedModel.id }),
          h(EditorTextInput, { label: 'Name', text: selectedModel.name, onTextChange: name => onUpdateModel(selectedModel, { name }) }),
          h(EditorTextInput, {
            label: 'Preview Camera Path',
            text: (selectedModel.previewCameraPath || []).join('.'),
            onTextChange: previewCameraPath => onUpdateModel(selectedModel, { previewCameraPath }) 
          }),
          h(EditorButton, { label: 'Delete', onButtonClick: () => onDeleteModel(selectedModel)}),
          h(EditorButton, {
            label: 'Open Model Exporer',
            onButtonClick: () => setShowExplorer(true),
            disabled: !explorerModelAsset
          }),
          !!explorerModelAsset && h(ObjectTreeList, { object: explorerModelAsset.asset.scene })
        ],
      ]
    }),
    !!explorerModelAsset && !!selectedModel && h(ModelResourceExplorerPopup, {
      key: selectedModel.id,
      onDismiss: () => setShowExplorer(false),
      visible: showExplorer,
      asset: explorerModelAsset.asset
    })
  ];
}
const ObjectTreeList = ({ object }) => {
  const { children } = object;
  return h('ol', {}, [
    !!children && children.map(child => {
      return h('li', {}, [
        h('div', {}, child.name),
        h(ObjectTreeList, { object: child })
      ])
    })
  ]);
}

const ModelResourceExplorerPopup = ({ onDismiss, visible, asset }) => {
  const ref = useRef();

  return h(PopupOverlay, { onBackgroundClick: () => onDismiss(), visible }, [
    h('div', { ref, style: { padding: '24px', backgroundColor: 'white' } }, [
      h(ModelResourceExplorerCanvas, {
        modelRoot: asset.scene
      })
    ])
  ])
}
