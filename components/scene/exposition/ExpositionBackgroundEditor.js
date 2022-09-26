// @flow strict

import { Quaternion } from "three";
import { h, useState } from "@lukekaalim/act"
import { ColorEditor } from "../../editor";
import {
  EditorButton,
  EditorForm,
  EditorHorizontalSection,
  FilesEditor,
  SelectEditor,
} from "../../editor/form";
import { useEffect } from "@lukekaalim/act/hooks";
import { useFreeCameraController } from "../../camera/useFreeCameraController";

/*::
import type { Component } from "@lukekaalim/act";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { ExpositionBackground, MiniTheater } from "@astral-atlas/wildspace-models";
import type { FreeCameraController } from "../../camera/useFreeCameraController";

export type ExpositionBackgroundEditorProps = {
  background: ExpositionBackground,
  onBackgroundChange: ExpositionBackground => mixed,

  client?: ?WildspaceClient,
  miniTheaters?: $ReadOnlyArray<MiniTheater>,
  miniTheaterCamera?: FreeCameraController,
};
*/
const defaultColorBackground = {
  type: 'color',
  color: '#ffffff'
}
const defaultImageBackground = {
  type: 'image',
  assetId: '',
}
const defaultQuaternion = new Quaternion().identity();
const defaultMiniTheaterBackground = {
  type: 'mini-theater',
  miniTheaterId: '',
  position: { x: 0, y: 0, z: 0 },
  rotation: { x: defaultQuaternion.x, y: defaultQuaternion.y, z: defaultQuaternion.z, w: defaultQuaternion.w }
}
const getDefaultBackgroundForType = (backgroundType) => {
  switch (backgroundType) {
    case 'color':
    default:
      return defaultColorBackground;
    case 'image':
      return defaultImageBackground;
    case 'mini-theater':
      return defaultMiniTheaterBackground;
  }
}

export const ExpositionBackgroundEditor/*: Component<ExpositionBackgroundEditorProps>*/ = ({
  onBackgroundChange,
  background,
  client = null,
  miniTheaters = [],
  miniTheaterCamera = null,
  children,
}) => {
  const backgroundTypeValues = [
    { title: 'Color', value: 'color' },
    { title: 'Image', value: 'image' },
    { title: 'Mini Theater', value: 'mini-theater' }
  ]
  const miniTheaterValues = miniTheaters.map(m =>
    ({ title: m.name, value: m.id }));

  const onBackgroundTypeChange = (backgroundType) => {
    onBackgroundChange(getDefaultBackgroundForType(backgroundType))
  }
  const onColorChange = async (nextColor) => {
    onBackgroundChange({ type: 'color', color: nextColor });
  };
  const onImageChange = async (file) => {
    if (!client || !file)
      return;
    const info = await client.asset.create(
      '', file.type,
      new Uint8Array(await file.arrayBuffer())
    );
    onBackgroundChange({
      type: 'image',
      assetId: info.description.id,
    });
  };
  const onMiniTheaterChange = async ({
    miniTheaterId = null,
    position = null, rotation = null
  }) => {
    if (background.type === 'mini-theater') {
      onBackgroundChange({
        ...background,
        position: position || background.position,
        rotation: rotation || background.rotation,
        miniTheaterId: miniTheaterId || background.miniTheaterId,
      });
    }
  };
  const onMiniTheaterCameraMouseClick = (e) => {
    if (!miniTheaterCamera)
      return;
      
    if (document.pointerLockElement === e.target) {
      document.exitPointerLock();
      const { position, rotation } = miniTheaterCamera;
      onMiniTheaterChange({
        position: { x: position.x, y: position.y, z: position.z },
        rotation: { x: rotation.x, y: rotation.y, z: rotation.z, w: rotation.w },
      });
    } else {
      e.target.requestPointerLock();
    }
  }
  const onMiniTheaterCameraMouseMove = (e) => {
    if (document.pointerLockElement !== e.target)
      return;
    if (!miniTheaterCamera)
      return;
    
    miniTheaterCamera.moveCursor(e.movementX, e.movementY);
  };

  return [
    h(EditorHorizontalSection, {}, [
      h(SelectEditor, {
        label: 'Background Type',
        values: backgroundTypeValues,
        selected: background.type,
        onSelectedChange: onBackgroundTypeChange
      }),
      background.type === 'color' && h(ColorEditor, {
        key: 'color',
        label: 'Background Color',
        color: background.color,
        onColorChange
      }),
      background.type === 'image' && h(FilesEditor, {
        key: 'image',
        value: background.assetId,
        label: 'Background Image',
        accept: 'image/*',
        onFilesChange: files => onImageChange(files[0]),
      }),
      background.type === 'mini-theater' && [
        h(SelectEditor, {
          key: 'theater-id',
          label: 'Mini Theater',
          values: miniTheaterValues,
          selected: background.miniTheaterId,
          onSelectedChange: miniTheaterId => onMiniTheaterChange({ miniTheaterId })
        }),
        miniTheaterCamera && h(EditorButton, {
          key: 'theater-camera',
          label: 'Change Camera Position',
          onClick: onMiniTheaterCameraMouseClick,
          onMouseMove: onMiniTheaterCameraMouseMove,
        })
      ],
    ])
  ];
}