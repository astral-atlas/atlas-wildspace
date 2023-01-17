// @flow strict

import { h, useState } from "@lukekaalim/act"

/*::
import type { Component } from "@lukekaalim/act";
import type { LibraryData, Game, MagicItem } from "@astral-atlas/wildspace-models";
import type { WildspaceClient } from "@astral-atlas/wildspace-client2";
import type { Cast } from "@lukekaalim/cast";

import type { LibrarySelection } from "../librarySelection";
import type { FormSchema } from "../LibraryEditorForm";
*/
import { LibraryAisle } from "../LibraryAisle";
import { useAisleFocus } from "../useAisleFocus";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { LibraryDesk } from "../LibraryDesk";
import { LibraryShelf } from "../LibraryShelf";
import { useLibrarySelection } from "../librarySelection";
import {
  EditorButton,
  EditorCheckboxInput,
  EditorForm,
  EditorTextInput,
  SelectEditor,
} from "../../editor/form";
import { castMagicItem, emptyRootNode } from "@astral-atlas/wildspace-models";
import { c } from "@lukekaalim/cast/shorthand";
import { castArray, castObject } from "@lukekaalim/cast/primitives";
import { renderLibraryEditorForm } from "../LibraryEditorForm";
import { RichTextSimpleEditor } from "../../richText/RichTextSimpleEditor";
import { MagicItemEditor } from "../../magicItem";

/*::
export type NPCAisleProps = {
  library: LibraryData,
  game: Game,
  client: WildspaceClient
};
*/

export const NPCAisle/*: Component<NPCAisleProps>*/ = ({
  library,
  game,
  client,
}) => {
  const { toggleFocus, focus } = useAisleFocus();
  const selection = useLibrarySelection();
  const selectedNPC = library.magicItems.find(m => selection.selected.has(m.id));

  const onMagicItemCreate = async () => {
    await client.game.magicItem.create(game.id, { title: 'Untitled magic item' })
  };
  const onMagicItemChange = async (magicItem) => {
    if (!selectedMagicItem)
      return;
    await client.game.magicItem.update(game.id, selectedMagicItem.id, {
      ...selectedMagicItem,
      ...magicItem,
    })
  }
  const onMagicItemRemove = async () => {
    if (!selectedMagicItem)
      return;
    await client.game.magicItem.destroy(game.id, selectedMagicItem.id)
  };

  const floor = h(LibraryFloor, {
    header: h(LibraryFloorHeader, { title: 'Magic Items' }, [
      h(EditorForm, {}, [
        h(EditorButton, {
          label: 'Create new Magic Item',
          onButtonClick: () => onMagicItemCreate()
        })
      ])
    ]),
    shelves: h(LibraryShelf, {
      selection,
      books: library.magicItems.map(m => ({
        id: m.id,
        title: m.title,
      })),
    })
  });
  const workstation = [
    !!selectedMagicItem && h('div', { style: {
      display: 'flex',
      flexDirection: 'column',
      height: '100%',
      width: '100%',
      padding: '1rem',
      position: 'absolute',
      boxSizing: 'border-box',
    }}, [
      h(MagicItemEditor, { magicItem: selectedMagicItem, onMagicItemChange }),
    ])
  ];
  const desk = h(LibraryDesk, {}, selectedMagicItem && [
    h(EditorForm, {}, [
      renderLibraryEditorForm(
        magicItemSchema,
        selectedMagicItem,
        onMagicItemChange,
        castMagicItem,
      ),
      h(EditorButton, { onButtonClick: toggleFocus, label: 'Edit Details' }),
      h(EditorButton, {
        label: 'Delete Magic Item',
        onButtonClick: () => onMagicItemRemove()
      })
    ])
  ]);

  return h(LibraryAisle, {
    focus,
    floor,
    workstation,
    desk
  })
}

const magicItemSchema/*: FormSchema<MagicItem>*/ = {
  type: 'object',
  props: {
    id: { type: 'string', disabled: true },
    title: { type: 'string', label: 'Title' },
    rarity: { type: 'string', label: 'Rarity' },
    requiresAttunement: { type: 'boolean', label: 'Requires Attunement'  },
    description: { type: 'unknown', label: 'Description'  },
    type: { type: 'string', label: 'Type'  },
    visibility: {
      label: 'Visability' ,
      discriminatingKey: 'type',
      type: 'union',
      values: [
        { type: 'object', props: { type: { type: 'literal', value: 'players-in-game' } }},
        { type: 'object', props: { type: { type: 'literal', value: 'game-master-in-game' } }},
      ]
    },
  }
}
