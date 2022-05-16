// @flow strict
/*::
import type { WildspaceClient, WikiConnection } from "@astral-atlas/wildspace-client2";
import type { GameData } from "../../game/data";
import type { Component } from '@lukekaalim/act';
*/

import { h, useEffect, useMemo, useState } from "@lukekaalim/act";
import { collab, receiveTransaction, sendableSteps } from "prosemirror-collab"

import { AssetLibraryWindow } from "./window";
import { AssetGrid, AssetGridItem } from "../grid";
import { useSelection } from "../../editor/selection";
import {
  EditorCheckboxInput,
  EditorForm,
  EditorFormSubmit,
  EditorTextInput,
} from "../../editor/form";
import { useGameConnection } from "../../game/data";
import {
  ProseMirror,
  prosePlugins,
  useProseMirrorEditorState,
} from "../../richText/ProseMirror";
import { Node } from "prosemirror-model";
import { EditorState, Plugin } from "prosemirror-state";
import { proseSchema } from "@astral-atlas/wildspace-models";
import { Step } from "prosemirror-transform";


/*::
export type WikiLibraryProps = {
  gameData: GameData,
  client: WildspaceClient
};
*/

export const WikiLibrary/*: Component<WikiLibraryProps>*/ = ({
  gameData,
  client
}) => {
  const [selection, select] = useSelection()

  const [times, wiki] = useGameConnection(client, gameData.game.id);

  if (!wiki)
    return 'Loading';

  const selected = gameData.wikiDocs.find(d => d.id === selection[0])

  const update = async (input) => {
    if (!selected)
      return;
    
    await client.game.wiki.update(gameData.game.id, selected.id, input);
  }
  const create = async () => {
    await client.game.wiki.create(gameData.game.id, { title: 'Untitled Document' });
  }

  return h(AssetLibraryWindow, {
    editor: selected && h(EditorForm, {}, [
      h(EditorTextInput, { label: 'ID', disabled: true, text: selected.id }),
      h(EditorTextInput, { label: 'Title', text: selected.title, onTextChange: title => update({ title }) }),
    ]),
    content: [
      h(EditorForm, { onEditorSubmit: create }, [
        h(EditorFormSubmit, { label: 'Create New Document' }),
      ]),
      h('hr'),
      h(AssetGrid, { }, gameData.wikiDocs.map(wikiDoc =>
        h(AssetGridItem, { id: wikiDoc.id, select, selected: !!selection.find(id => id === wikiDoc.id) }, wikiDoc.title))),
      h('hr'),
    ]
  })
}

