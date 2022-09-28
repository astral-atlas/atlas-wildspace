// @flow strict

import { h, useMemo } from "@lukekaalim/act";
import { MiniTheaterCanvas } from "../../miniTheater/MiniTheaterCanvas";
import { RenderCanvas } from "../../three";
import { ExpositionBackgroundRenderer } from "./ExpositionBackgroundRenderer";
import { MiniTheaterScene } from "../../miniTheater/MiniTheaterScene";
import { MiniTheaterScene2 } from "../../miniTheater/MiniTheaterScene2";
import { EditorForm, EditorHorizontalSection } from "../../editor/form";
import { ExpositionBackgroundEditor } from "./ExpositionBackgroundEditor";
import { FreeCamera } from "../../camera/FreeCamera";
import { GridHelperGroup } from "../../../docs/src/controls/helpers";
import {
  miniQuaternionToThreeQuaternion,
  miniVectorToThreeVector,
} from "../../utils/miniVector";
import styles from './exposition.module.css';
import { ExpositionDescription } from "./ExpositionDescription";
import { createMaskForMonsterActor, proseNodeJSONSerializer } from "@astral-atlas/wildspace-models";
import { MiniTheaterCamera } from "../../camera/MiniTheaterCamera";
import { useLibraryMiniTheaterResources } from "../../miniTheater/resources/libraryResources";
import { useMiniTheaterController2 } from "../../miniTheater/useMiniTheaterController2";

/*::
import type { Exposition, LibraryData } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
import type { AssetDownloadURLMap } from "../../asset/map";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { ElementNode } from "@lukekaalim/act/element";

export type ExpositionEditorProps = {
  editorPrefixElement?: ?ElementNode,

  client?: WildspaceClient,
  exposition: Exposition,
  onExpositionChange: Exposition => mixed,
  library: LibraryData,
  assets: AssetDownloadURLMap
};
*/

export const ExpositionEditor/*: Component<ExpositionEditorProps>*/ = ({
  exposition,
  onExpositionChange,
  library,
  assets,
  client = null,
  editorPrefixElement = null,
}) => {
  const onBackgroundChange = (background) => {
    onExpositionChange({
      ...exposition,
      background,
    });
  }
  const onDescriptionUpdate = (rootNode, nextVersion) => {
    onExpositionChange({
      ...exposition,
      description: {
        rootNode,
        version: nextVersion,
      }
    })
  }

  return h('div', { }, [
    exposition.background.type !== 'mini-theater' ?
      h(ExpositionBackgroundRenderer, {
        background: exposition.background,
        assets,
      }) :
      h(ExpositionMiniTheaterEditor, { library, background: exposition.background, onBackgroundChange }),
    h('div', { style: { position: 'relative', }, class: styles.editorForm }, [
      h(EditorForm, {}, [
        h(EditorHorizontalSection, {}, [
          editorPrefixElement,
          h(ExpositionBackgroundEditor, {
            client,
            miniTheaters: library.miniTheaters,
            background: exposition.background,
            onBackgroundChange
          }),
        ])
      ]),
    ]),
    h(ExpositionDescription, {
      editable: true,
      onDescriptionUpdate,
      description: exposition.description.rootNode,
      version: exposition.description.version
    })
  ]);
}

const ExpositionMiniTheaterEditor = ({
  library,
  background,
  onBackgroundChange,
}) => {
  const resources = useLibraryMiniTheaterResources(library)

  const miniTheater = library.miniTheaters.find(m => m.id === background.miniTheaterId);
  if (!miniTheater)
    return null;
  const miniTheaterState = {
    cursor: null,
    isGM: false,
    layer: null,
    miniTheater,
    resources,
    selection: { type: 'none' }
  };

  const onFreeCameraChange = (camera) => {
    if (!miniTheater || background.type !== 'mini-theater')
      return;
    
    onBackgroundChange({
      ...background,
      position: { x: camera.position.x, y: camera.position.y, z: camera.position.z },
      rotation: { x: camera.quaternion.x, y: camera.quaternion.y, z: camera.quaternion.z, w: camera.quaternion.w }
    })
  };

  return h(RenderCanvas, { className: styles.miniTheaterBackground }, [
    h(MiniTheaterScene2, {
      miniTheaterState,
    }),
    h(GridHelperGroup),
    h(FreeCamera, {
      onFreeCameraChange,
      position: miniVectorToThreeVector(background.position),
      quaternion: miniQuaternionToThreeQuaternion(background.rotation),
    })
  ])
}