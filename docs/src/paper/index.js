// @flow strict
/*::
import type { Page } from "..";
*/

import { Document, Markdown } from "@lukekaalim/act-rehersal";
import { h, useState } from "@lukekaalim/act";

import paperText from './index.md?raw';
import characterSheetText from './characterSheet.md?raw';

import { MagicItemCardDemo } from "./MagicItemCardDemo";
import { paperDividersPage } from "./dividers";
import { createMockCharacter, createMockImageAsset } from "@astral-atlas/wildspace-test";
import { ScaledLayoutDemo } from "../demo";
import { CharacterSheet, EditorCheckboxInput, EditorForm } from "@astral-atlas/wildspace-components";
import { MiniPreviewDemo } from "./characterSheet";
import { v4 as uuid } from 'uuid';

const CharacterSheetDemo = () => {
  const iconAsset = createMockImageAsset();
  const [character, setCharacter] = useState({ ...createMockCharacter(), initiativeIconAssetId: iconAsset.description.id });
  const [assets, setAssets] = useState(new Map([
    [iconAsset.description.id, iconAsset]
  ]));
  const [disabled, setDisabled] = useState(false);

  const client = {
    asset: {
      create: async (name, type, bytes) => {
        const blob = new Blob(([bytes]/*: any*/), { type })
        const description = {
          id: uuid(),
        };
        const downloadURL = URL.createObjectURL(blob);
        setAssets(a => new Map([...a, [description.id, { description, downloadURL }]]))
        return { description, downloadURL };
      },
    },
    game: {
      character: {
        update: async (game, charId, char) => {
          setCharacter(char);
        },
      }
    }
  };

  return [
    h(ScaledLayoutDemo, { style: { backgroundColor: 'black' }},
      // $FlowFixMe
      h(CharacterSheet, { character, assets, client, disabled })),
    h(EditorForm, {}, [
      h(EditorCheckboxInput, { checked: disabled, label: 'disabled', onCheckedChange: disabled => setDisabled(disabled) })
    ]),
    h('pre', {}, JSON.stringify({ character }, null, 2))
  ];
}

const Demo = ({ node }) => {
  switch (node.attributes.name) {
    case 'magicItemCard':
      return h(MagicItemCardDemo);
    case 'character':
      return h(CharacterSheetDemo);
    case 'characterMini':
      return h(MiniPreviewDemo);
  }
  return null;
}

const directives = {
  'demo': Demo
}

export const characterSheetPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: characterSheetText, directives })),
  link: { children: [], name: 'Character Sheet', href: '/paper/characterSheet' }
};
export const paperPage/*: Page*/ = {
  content: h(Document, {}, h(Markdown, { text: paperText, directives })),
  link: { children: [
    paperDividersPage.link,
    characterSheetPage.link,
  ], name: 'Paper', href: '/paper' }
};

export const paperPages = [
  paperPage,
  paperDividersPage,
  characterSheetPage,
];
