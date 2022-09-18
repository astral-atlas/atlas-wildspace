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
import { useLoopController } from "../../three/useLoopController";
import { PopupOverlay } from "../../layout/PopupOverlay";
import { ModelResourceExplorerCanvas } from "../../resources/ModelResourceExplorerCanvas";
import {
  useModelResourceAssetMap,
} from "../../resources/useModelResourceAssetMap";
import { useModelResourceAssetsIconURL } from "../../resources/useModelResourceAssetsIconURL";
import { getObject3DForModelResourcePath } from "../../resources/modelResourceUtils";

/*::
export type MiniTheaterTerrainAisleProps = {
  game: Game,
  assets: AssetDownloadURLMap,
  client: WildspaceClient,
  library: LibraryData,
}
*/

export const MiniTheaterTerrainAisle/*: Component<MiniTheaterTerrainAisleProps>*/ = ({
  game,
  assets,
  client,
  library
}) => {
  const selection = useLibrarySelection();

  const modelResourceIds = useMemo(() => [...new Set(library.terrainProps.map(tp => tp.modelResourceId))]
    .map(id => library.modelResources.find(r => r.id === id))
    .filter(Boolean)
  , [library.terrainProps]);

  const [modelAssets, loader] = useModelResourceAssetMap(modelResourceIds, assets);
  const modelAssetPathMap = useMemo(() => {
    return new Map(library.terrainProps
      .map((tp) => {
        const asset = modelAssets.get(tp.modelResourceId);
        if (!asset)
          return null;
        return [tp.id, {
          asset: asset.asset,
          path: tp.iconPreviewCameraModelPath,
        }]
      })
      .filter(Boolean))
  }, [library.terrainProps])
  const modelIconMap = useModelResourceAssetsIconURL(modelAssetPathMap);

  const terrainPropBooks = library.terrainProps.map(t => ({
    title: t.name,
    id: t.id,
    coverURL: modelIconMap.get(t.id)?.previewIconURL
  }))

  const onAddTerrainPiece = async () => {
    if (!stagingModelId || !stagingName)
      return;
    await client.game.miniTheater.terrainProps.create(game.id, {
      name: stagingName,
      iconPreviewCameraModelPath: stagingCameraPath.split('.'),
      modelPath: stagingPath.split('.'),
      modelResourceId: stagingModelId,
    })
  };
  const onDeleteTerrainProp = async (modelToDelete) => {
  }
  const onUpdateTerrainProp = async (prevTerrainProp, { name, previewCameraPath }) => {
  }
  const [showExplorer, setShowExplorer] = useState(false);

  const [stagingModelId, setStagingModelId] = useState/*:: <?ModelResourceID>*/(null)
  const [stagingName, setStagingName] = useState('Untitled Terrain Piece')
  const [stagingCameraPath, setStagingCameraPath] = useState('Piece.Camera');
  const [stagingPath, setStagingPath] = useState('Piece');

  const selectedTerrainProp = library.terrainProps.find(m => selection.selected.has(m.id))
  const modelAsset = selectedTerrainProp && modelAssets.get(selectedTerrainProp.modelResourceId);

  const floor = [
    h(LibraryFloorHeader, { title: 'Terrain Pieces' }, [
      h(EditorForm, {}, [
        h(EditorHorizontalSection, {}, [
          h(SelectEditor, {
            values: [
              { value: '', title: 'None' },
              ...library.modelResources.map(m => ({ title: m.name, value: m.id }))
            ],
            selected: stagingModelId || '',
            onSelectedChange: (id) => setStagingModelId(id)
          }),
          h(EditorTextInput, { label: 'Name', onTextInput: t => setStagingName(t), text: stagingName }),
          h(EditorTextInput, { label: 'Path to model (. seperated)', onTextInput: t => setStagingPath(t) }),
          h(EditorTextInput, { label: 'Path to preview camera (. seperated)', onTextInput: t => setStagingCameraPath(t) }),
          h(EditorButton, { label: 'Upload', onButtonClick: onAddTerrainPiece, disabled: !(stagingModelId && stagingName) }),
        ])
      ])
    ]),
    h(LibraryShelf, { title: 'Terrain Props', selection, books: terrainPropBooks })
  ];

  const desk = [
    !!selectedTerrainProp && [
      h(EditorTextInput, { disabled: true, label: 'Terrain ID', text: selectedTerrainProp.id }),
      h(SelectEditor, {
        label: 'Model Resource',
        values: library.modelResources.map(m => ({ title: m.name, value: m.id })),
        selected: selectedTerrainProp.modelResourceId,
        disabled: true
      }),
      h(EditorTextInput, { label: 'Name', text: selectedTerrainProp.name, onTextChange: name => onUpdateTerrainProp(selectedTerrainProp, { name }) }),
      h(EditorTextInput, {
        label: 'Preview Camera Path',
        text: (selectedTerrainProp.iconPreviewCameraModelPath || []).join('.'),
        onTextChange: previewCameraPath => onUpdateTerrainProp(selectedTerrainProp, { previewCameraPath }) 
      }),h(EditorTextInput, {
        label: 'Model Path',
        text: (selectedTerrainProp.modelPath || []).join('.'),
        onTextChange: previewCameraPath => onUpdateTerrainProp(selectedTerrainProp, { previewCameraPath }) 
      }),
      h(EditorButton, { label: 'Delete', onButtonClick: () => onDeleteTerrainProp(selectedTerrainProp)}),
      h(EditorButton, {
        label: 'Open Model Exporer',
        onButtonClick: () => setShowExplorer(true),
        disabled: !modelAsset
      })
    ],
  ]

  const modelRoot = modelAsset && selectedTerrainProp &&
    getObject3DForModelResourcePath(modelAsset.asset.scene, selectedTerrainProp.modelPath)

  return [
    h(LibraryAisle, { floor, desk, wideDesk: true }),
    
    !!modelRoot && !!selectedTerrainProp && h(ModelResourceExplorerPopup, {
      key: selectedTerrainProp.id,
      onDismiss: () => setShowExplorer(false),
      visible: showExplorer,
      modelRoot
    })
  ];
}

const ModelResourceExplorerPopup = ({ onDismiss, visible, modelRoot }) => {
  const ref = useRef();

  return h(PopupOverlay, { onBackgroundClick: () => onDismiss(), visible }, [
    h('div', { ref, style: { padding: '24px', backgroundColor: 'white' } }, [
      h(ModelResourceExplorerCanvas, {
        modelRoot
      })
    ])
  ])
}
