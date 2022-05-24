// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Character, Player, Game, Board } from "@astral-atlas/wildspace-models";
import type { AssetDownloadURLMap } from "../asset/map";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
*/

import {
  BrandedTextInput,
  ProficiencyInput, PlainNumberInput, SquareDivider, SegmentedTop,
  SegmentedBottom,
} from "@astral-atlas/wildspace-components";
import { h, useEffect, useRef, useState } from '@lukekaalim/act';
import { HealthDivider } from "../dividers/box";
import { FeatureSheet } from "./dividers/FeatureSheet";

import classes from './CharacterSheet.module.css';
import {
  EditorButton,
  EditorForm,
  FilesButtonEditor,
  SelectEditor,
} from "../editor/form";
import { ThreeCanvasScene } from "../scenes/ThreeCanvasSceneProps";
import { perspectiveCamera } from "@lukekaalim/act-three";
import { useLookAt } from "@lukekaalim/act-three";
import { Vector3 } from "three";
import { useFullscreen } from "../utils";
import { useBoardCameraControl } from "../../docs/src/controls/finalDemo";
import { useKeyboardTrack } from "../keyboard/track";
import { useElementKeyboard } from "../keyboard/changes";
import { useSubscriptionList } from "../subscription";
import { Encounter2 } from "../encounter/Encounter";
import { EncounterBoard } from "../encounter/EncounterBoard";
import { EncounterBoardCharacterPiece } from "../encounter/EncounterBoardCharacterPiece";
import { raycastManagerContext, useRaycastManager } from "../raycast/manager";
import { EditorRangeInput } from "../editor";
import { CharacterSheetMiniPreview } from "./CharacterSheet/CharacterSheetMiniPreview";
import debounce from "lodash.debounce";

/*::
export type CharacterSheetProps = {
  disabled?: boolean,
  character: Character,
  assets: AssetDownloadURLMap,

  client: WildspaceClient,
};
*/

export const CharacterSheet/*: Component<CharacterSheetProps>*/ = ({
  disabled = false,
  character,
  assets,
  client,
}) => {
  return h('div', { class: classes.characterSheet },
    h(FeatureSheet, { style: { display: 'inline', flexDirection: 'column' } }, 
      h(CharacterEditor, { character, disabled, assets, client }))
  );
};

export const CharacterEditor/*: Component<CharacterSheetProps>*/  = ({ character, disabled, assets, client }) => {
  const onMiniImageChange = async (imageFile) => {
    const array = new Uint8Array(await imageFile.arrayBuffer());
    const { description } = await client.asset.create(
      `${character.name}s_mini_icon`,
      imageFile.type,
      array,
    );
    await client.game.character.update(character.gameId, character.id, {
      ...character,
      initiativeIconAssetId: description.id,
    });
  }
  const onMaxHitpointsChange = async (maxHitpoints) => {
    await client.game.character.update(character.gameId, character.id, {
      ...character,
      maxHitpoints,
    });
  }
  const onInitiativeChange = async (initiativeBonus) => {
    await client.game.character.update(character.gameId, character.id, {
      ...character,
      initiativeBonus,
    });
  }
  const onNameChange = async (name) => {
    await client.game.character.update(character.gameId, character.id, {
      ...character,
      name,
    });
  }

  return h('div', { style: { overflow: 'auto', display: 'flex', flexDirection: 'column', alignItem: 'center' }}, [
    h(BrandedTextInput, {
      style: { overflow: 'hidden', maxWidth: '100%' },
      disabled,
      value: character.name,
      onInput: debounce(name => onNameChange(name), 200)
    }),
    h('div', { style: { display: 'flex', flexDirection: 'row' }}, [
      h(HealthDivider, { style: { flex: 1, padding: '1rem', margin: '0.5rem', display: 'flex', flexDirection: 'column', alignItems: 'center' } }, [
        h(StatEditor, { disabled, character, onMaxHitpointsChange, onInitiativeChange })
      ]),
      h(HealthDivider, { style: { flex: 1, padding: '1rem', margin: '0.5rem', display: 'flex' } }, [
        h(SquareDivider, { style: { flex: 1 }}, [
          h(MiniEditor, { disabled, character, assets, onMiniImageChange })
        ])
      ])
    ])
  ]);
}

const StatEditor = ({ disabled, character, onMaxHitpointsChange, onInitiativeChange }) => {
  return h('div', { class: classes.statEditor }, [
    h(ProficiencyInput, {
      disabled,
      value: character.initiativeBonus,
      onInput: debounce(initiativeBonus => onInitiativeChange(initiativeBonus), 200),
    }, 'Initiative Bonus'),
    h(SegmentedTop, { style: { marginBottom: '0.25rem' }, classList: [classes.health] }, [
      h('label', {}, [
        h('span', {}, 'Hitpoints'),
        h(PlainNumberInput, {
          disabled,
          value: character.maxHitpoints,
          onInput: debounce(maxHitpoints => onMaxHitpointsChange(maxHitpoints), 200)
        }),
      ])
    ]),
    h(SegmentedBottom),
  ])
}

const MiniEditor = ({ disabled, character, assets, onMiniImageChange }) => {
  const iconAsset = character.initiativeIconAssetId && assets.get(character.initiativeIconAssetId);

  const canvasRef = useRef();
  const [el, setFullscreen] = useFullscreen()

  return h('div', { class: classes.miniEditor }, [
    h(EditorForm, {}, [
      h(CharacterSheetMiniPreview, { canvasRef, character, iconAsset, assets, isFullscreen: !!el }),
      h(EditorButton, { label: 'Toogle Fullscreen Preview', onButtonClick: () => {
        setFullscreen(canvasRef.current || null)
      } }),
      h(SelectEditor, { label: 'Miniture Type', values: [{value: 'Sprite'}], selected: 'Sprite' }),
      h(FilesButtonEditor, { disabled, label: 'Upload Image', onFilesChange: e => onMiniImageChange(e[0]), accept: 'image/*' }),
      !!iconAsset && h('img', { src: iconAsset.downloadURL }),
    ])
  ])
}

export * from './CharacterSheet/CharacterSheetMiniPreview.js';