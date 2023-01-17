// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { LibraryData, Monster, MonsterActor, Game, ModelResourceID } from "@astral-atlas/wildspace-models";
import type { AssetDownloadURLMap } from "../../asset/map";
import type { GLTF } from "three/examples/jsm/loaders/GLTFLoader.js";
import type {
  MiniTheaterAssetResources,
  MiniTheaterRenderResources,
} from "../../miniTheater/useMiniTheaterResources";
import type { ThreeController } from "../../controllers";
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
import { getObject3DForModelResourcePath } from "../../resources/modelResourceUtils";
import { EditorLine } from "../../editor/line";
import {
  TerrainPropEditor,
} from "../../terrain/TerrainPropEditor";
import { useAisleFocus } from "../useAisleFocus";
import { createIconForTerrainProp } from "../../miniTheater/terrain/icon";
import { LibraryDesk } from "../LibraryDesk";
import { GameResourceEditor } from "../editor";
import { castTerrainProp, createGamePageFromLibrary } from "@astral-atlas/wildspace-models";
import { createTerrainPropObject } from "../../miniTheater/terrain/terrainProp";
import { useLibraryMiniTheaterResources } from "../../miniTheater/resources/libraryResources";

/*::
export type MiniTheaterTerrainAisleProps = {
  game: Game,
  assets: AssetDownloadURLMap,
  client: WildspaceClient,
  library: LibraryData,

  threeController: ThreeController,
}
*/

export const MiniTheaterTerrainAisle/*: Component<MiniTheaterTerrainAisleProps>*/ = ({
  game,
  assets,
  client,
  library,
  threeController,
}) => {
  const gamePage = createGamePageFromLibrary(library, game);

  const miniTheaterResources = useLibraryMiniTheaterResources(library);

  const selection = useLibrarySelection();
  const { focus, toggleFocus } = useAisleFocus()

  const [icons, setIcons] = useState(new Map());
  useEffect(() => {
    const iconResults = library.terrainProps.map(prop =>
      createIconForTerrainProp(prop, miniTheaterResources, threeController));
    Promise.all(iconResults
        .map(i => i && i.promise)
        .filter(Boolean))
      .then(terrainPropIcons =>
        setIcons(new Map(terrainPropIcons.map(i => [i.propId, i.url]))))

    return () => {
      for (const iconResult of iconResults)
        iconResult && iconResult.cancel();
    }
  }, []);
  const selectedProp = library.terrainProps.find(m => selection.selected.has(m.id));
  const modelResourceObject = useMemo(() => {
    return selectedProp && createTerrainPropObject(selectedProp, miniTheaterResources);
  }, [selectedProp, miniTheaterResources]);
  const onTerrainPropChange = async (nextProp) => {
    if (!selectedProp)
      return;
    await client.game.miniTheater.terrainProps.update(game.id, selectedProp.id, nextProp)
  };
  
  return [
    h(LibraryAisle, {
      floor: h(LibraryFloor, { selection }, [
        h(LibraryShelf, { selection, books: library.terrainProps.map(prop => ({
          id: prop.id,
          title: prop.title,
          coverURL: icons.get(prop.id) || null,
        })) })
      ]),
      desk: h(LibraryDesk, { }, [
        !!selectedProp && h(GameResourceEditor, {
          client: client.game.miniTheater.terrainProps,
          gamePage,
          resources: library.terrainProps,
          schema: { type: 'object', props: {} },
          selection,
          tagClient: client.game.tags,
          castResource: castTerrainProp,
        }),
        h(EditorButton, { label: 'Toggle', onButtonClick: toggleFocus }),
      ]),
      wideDesk: true,
      workstation: modelResourceObject && selectedProp && h(TerrainPropEditor, {
        resources: miniTheaterResources,
        terrainProp: selectedProp,
        onTerrainPropChange
      }),
      focus
    }),
  ];

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
      floorShapes: [],
    })
  };
  const onDeleteTerrainProp = async (modelToDelete) => {
    await client.game.miniTheater.terrainProps.destroy(game.id, modelToDelete.id);
  }
  const onUpdateTerrainProp = async (
    prevTerrainProp,
    { name, iconPreviewCameraModelPath, modelPath, floorShapes, modelResourceId }
  ) => {
    await client.game.miniTheater.terrainProps.update(game.id, prevTerrainProp.id, {
      ...prevTerrainProp,
      floorShapes: floorShapes || prevTerrainProp.floorShapes,
      name: name || prevTerrainProp.name,
      iconPreviewCameraModelPath: iconPreviewCameraModelPath || prevTerrainProp.iconPreviewCameraModelPath,
      modelPath: modelPath || prevTerrainProp.modelPath,
      modelResourceId: modelResourceId || prevTerrainProp.modelResourceId,
    });
  }
  const [showExplorer, setShowExplorer] = useState(false);

  const [stagingModelId, setStagingModelId] = useState/*:: <?ModelResourceID>*/(null)
  const [stagingName, setStagingName] = useState('Untitled Terrain Piece')
  const [stagingCameraPath, setStagingCameraPath] = useState('Piece.Camera');
  const [stagingPath, setStagingPath] = useState('Piece');

  const modelAsset = selectedTerrainProp && modelAssets.get(selectedTerrainProp.modelResourceId);


  const floorHeader = [
    h(LibraryFloorHeader, { title: 'Terrain Pieces' }),
    h('div', { style: { width: '100%' } }, [
      h(EditorForm, {}, [
        h(EditorVerticalSection, {}, [
          h(EditorHorizontalSection, {}, [
            h(SelectEditor, {
              label: 'ResourceModel',
              values: [
                { value: '', title: 'None' },
                ...library.modelResources.map(m => ({ title: m.name, value: m.id }))
              ],
              selected: stagingModelId || '',
              onSelectedChange: (id) => setStagingModelId(id)
            }),
            h(EditorTextInput, { label: 'Name', onTextInput: t => setStagingName(t), text: stagingName }),
          ]),
          h(EditorHorizontalSection, {}, [
            h(EditorTextInput, { label: 'Path to model (. seperated)', onTextInput: t => setStagingPath(t) }),
            h(EditorTextInput, { label: 'Path to preview camera (. seperated)', onTextInput: t => setStagingCameraPath(t) }),
          ]),
          h(EditorHorizontalSection, {}, [
            h(EditorButton, { label: 'Upload', onButtonClick: onAddTerrainPiece, disabled: !(stagingModelId && stagingName) }),
          ]),
        ]),
      ]),
    ]),
  ]

  const floor = h(LibraryFloor, {
    header: floorHeader
  }, [
    library.modelResources.map(modelResource => {
      const terrainProps = library.terrainProps.filter(t => t.modelResourceId === modelResource.id);
      const books = terrainProps.map(t => ({
        title: t.name,
        id: t.id,
        coverURL: modelIconMap.get(t.id)?.previewIconURL
      }));
      return h(LibraryShelf, { title: modelResource.name, selection, books })
    }),
    h(LibraryShelf, { title: 'Orphan Terrain Props', selection, books: [
      ...library.terrainProps.
        filter(terrain => {
          return !library.modelResources.some(mr => terrain.modelResourceId === mr.id);
        })
        .map(terrain => {
          return { title: terrain.name, id: terrain.id }
        })
    ] })
  ]);

  const childObjects = modelAsset && modelAsset.asset.scene.children;
  const saveStaging = async () => {
    if (!selectedTerrainProp || !stagingTerrainProp)
      return;

    await onUpdateTerrainProp(selectedTerrainProp, stagingTerrainProp);
    setStagingTerrainProp(null)
  }

  const desk = [
    !!selectedTerrainProp && [
      h(EditorTextInput, { disabled: true, label: 'Terrain ID', text: selectedTerrainProp.id }),
      h(SelectEditor, {
        label: 'Model Resource',
        values: library.modelResources.map(m => ({ title: m.name, value: m.id })),
        selected: selectedTerrainProp.modelResourceId,
        onSelectedChange: modelResourceId => onUpdateTerrainProp(selectedTerrainProp, { modelResourceId })
      }),
      h(EditorTextInput, {
        label: 'Name',
        text: selectedTerrainProp.name,
        onTextChange: name => onUpdateTerrainProp(selectedTerrainProp, { name })
      }),
      h(EditorTextInput, {
        label: 'Preview Camera Path',
        text: (selectedTerrainProp.iconPreviewCameraModelPath || []).join('.'),
        onTextChange: iconPreviewCameraModelPath => onUpdateTerrainProp(selectedTerrainProp, { iconPreviewCameraModelPath: iconPreviewCameraModelPath.split('.') }) 
      }),
      h(EditorTextInput, {
        label: 'Model Path',
        text: (selectedTerrainProp.modelPath || []).join('.'),
        onTextChange: modelPath => onUpdateTerrainProp(selectedTerrainProp, { modelPath: modelPath.split('.') }) 
      }),
      !!modelAsset && h(ObjectTreeList, { object: modelAsset.asset.scene }),
      h(EditorButton, { label: 'Delete', onButtonClick: () => onDeleteTerrainProp(selectedTerrainProp)}),
      h(EditorButton, {
        label: 'Open Model Exporer',
        onButtonClick: () => toggleFocus(),
        disabled: !modelAsset
      }),
      h(EditorButton, {
        label: 'Save Changes',
        onButtonClick: () => saveStaging(),
      })
    ],
  ]

  const workstation = !!modelAsset && !!selectedTerrainProp && h(TerrainPropEditor, {
    modelResourceObject: modelAsset.asset.scene,
    terrainProp: stagingTerrainProp || selectedTerrainProp,
    onTerrainPropChange: setStagingTerrainProp,
  })

  return [
    h(LibraryAisle, { floor, desk, wideDesk: true, workstation, focus }),
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