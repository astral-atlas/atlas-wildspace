// @flow strict
import { h, useState } from "@lukekaalim/act"
import colorString from 'color-string'

import { AssetLibraryWindow } from "./window";
import {
  EditorButton,
  EditorCheckboxInput,
  EditorForm,
  EditorFormSubmit,
  EditorHorizontalSection,
  EditorTextAreaInput,
  EditorTextInput,
  FilesEditor,
  SelectEditor,
} from "../../editor/form";
import { AssetGrid, AssetGridItem } from "../grid";
import { useSelection } from "../../editor/selection";
import { useAsync } from "../../utils/async";

/*::
import type { GameID, ExpositionScene } from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { Component } from "@lukekaalim/act";

import type { LocalAsset } from "../../audio/track";
import type { GameData } from "../../game/data";

export type MagicItemLibraryProps = {
  gameId: GameID,
  data: GameData,
  client: WildspaceClient,
};
*/

export const MagicItemLibrary/*: Component<MagicItemLibraryProps>*/ = ({ gameId, client, data }) => {
  const [selection, select] = useSelection()

  const onNewMagicItemSubmit = async () => {
    await client.game.magicItem.create(gameId);
  }
  const onUpdateSelectedMagicItem = async (nextProps) => {
    if (!selectedMagicItem)
      return;
    await client.game.magicItem.update(gameId, selectedMagicItem.id, { ...selectedMagicItem, ...nextProps });
  }
  const onDeleteMagicItem = async () => {
    if (!selectedMagicItem)
      return;
    await client.game.magicItem.destroy(gameId, selectedMagicItem.id);
  }

  const selectedMagicItem = data.magicItems.find(m => m.id === selection[0]);

  const editor = [
    !!selectedMagicItem && h(EditorForm, {}, [
      h('a', { href: `/magic-item?gameId=${data.game.id}&magicItemId=${selectedMagicItem.id}` }, 'Web Link'),
      h(EditorButton, { label: 'Delete Magic Item', onButtonClick: onDeleteMagicItem }),
      h(EditorTextInput, {
        label: 'title',
        text: selectedMagicItem.title,
        onTextChange: title => onUpdateSelectedMagicItem({ title }) }),
      h(SelectEditor, {
        label: 'visibility',
        values: [{ value: 'players-in-game' }, { value: 'game-master-in-game' }],
        selected: selectedMagicItem.visibility && selectedMagicItem.visibility.type || 'game-master-in-game',
        onSelectedChange: (type) => onUpdateSelectedMagicItem({
          visibility: type === 'players-in-game' ? { type: 'players-in-game' } : { type: 'game-master-in-game' } })
      }),
      h(EditorTextAreaInput, {
        label: 'description',
        text: selectedMagicItem.description,
        onTextChange: description => onUpdateSelectedMagicItem({ description }) }),
      h(EditorTextAreaInput, {
        label: 'rarity',
        text: selectedMagicItem.rarity,
        onTextChange: rarity => onUpdateSelectedMagicItem({ rarity }) }),
      h(EditorCheckboxInput, {
        label: 'requiresAttunement',
        checked: selectedMagicItem.requiresAttunement,
        onCheckedChange: requiresAttunement => onUpdateSelectedMagicItem({ requiresAttunement }) }),
      h(EditorTextAreaInput, {
        label: 'type',
        text: selectedMagicItem.type,
        onTextChange: type => onUpdateSelectedMagicItem({ type }) }),
    ])
  ];
  const content = [
    h(EditorForm, { onEditorSubmit: onNewMagicItemSubmit }, [
      h(EditorFormSubmit, { label: 'Create new Magic Item' })
    ]),
    h('hr'),
    h(AssetGrid, {}, data.magicItems.map(magicItem =>
      h(AssetGridItem, { select, id: magicItem.id }, magicItem.title)),
    ),
  ];

  return h(AssetLibraryWindow, { editor, content })
};

