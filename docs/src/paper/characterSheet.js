// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
import { createMockCharacter, createMockImageAsset } from "@astral-atlas/wildspace-test";
import { CharacterSheetMiniPreview } from "@astral-atlas/wildspace-components";
import { h, useRef } from "@lukekaalim/act";

export const MiniPreviewDemo/*: Component<>*/ = () => {
  const character = createMockCharacter();
  const image = createMockImageAsset();

  const canvasRef = useRef();
  const assets = new Map([
    [image.description.id, image]
  ])

  return [
    h(CharacterSheetMiniPreview, { canvasRef, isFullscreen: false, assets, character }),
  ]
};

