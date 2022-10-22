// @flow strict
/*::
import type { MagicItem } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
*/

import { proseNodeJSONSerializer } from "@astral-atlas/wildspace-models"
import { h } from "@lukekaalim/act"
import styles from './MagicItemRenderer.module.css'
import { MagicItemCard } from "../paper/MagicItem";
import { SquareDivider, dividerStyles } from "../dividers/box";
import { RichTextReadonlyRenderer } from "../richText/RichTextReadonlyRenderer";
import { CopperAttributeTag } from "../paper/AttributeTag";
import { EditorCheckboxInput, EditorTextInput, SelectEditor } from "../editor/form";
import { RichTextSimpleEditor } from "../richText/RichTextSimpleEditor";

/*::
export type MagicItemRendererProps = {
  magicItem: MagicItem
}
*/

export const MagicItemRenderer/*: Component<MagicItemRendererProps>*/ = ({
  magicItem
}) => {
  return h('div', { class: styles.container }, [
    h('div', { classList: [styles.background, dividerStyles.feature] }),
    
    h('div', { class: styles.content }, [
      h('div', { classList: [styles.header, dividerStyles.square] }, [
        h('h3', {}, magicItem.title),
      ]),
      h('div', { class: styles.attributes }, [
        h(CopperAttributeTag, {
          //classList: [styles.attribute],
          label: h('span', { class: styles.attributeLabel }, 'Rarity'),
          alignment: 'right'
        }, h('span', { class: styles.attributeValue }, magicItem.rarity)),
        h(CopperAttributeTag, {
          //classList: [styles.attribute],
          label: h('span', { class: styles.attributeLabel }, 'Requres Attunment'),
          alignment: 'right'
        }, h('span', { class: styles.attributeValue }, magicItem.requiresAttunement ? 'Yes' : 'No'))
      ]),
      h('div', { class: styles.description }, [
        h(RichTextReadonlyRenderer, {
          node: proseNodeJSONSerializer.deserialize(magicItem.description)
        })
      ]),
    ]),
  ])
}

/*::
export type MagicItemEditorProps = {
  magicItem: MagicItem,
  onMagicItemChange?: MagicItem => mixed,
}
*/

export const MagicItemEditor/*: Component<MagicItemEditorProps>*/ = ({
  magicItem,
  onMagicItemChange = _ => {}
}) => {
  return h('div', { class: styles.container }, [
    h('div', { classList: [styles.background, dividerStyles.feature] }),
    
    h('div', { class: styles.content }, [
      h('div', { classList: [styles.header, dividerStyles.square] }, [
        h(EditorTextInput, {
          text: magicItem.title,
          onTextChange: title => onMagicItemChange({ ...magicItem, title })
        }),
      ]),
      h('div', { class: styles.attributes }, [
        h(CopperAttributeTag, {
          //classList: [styles.attribute],
          label: h('span', { class: styles.attributeLabel }, 'Rarity'),
          alignment: 'right'
        }, h(SelectEditor, {
          values: [
            { value: 'common', title: 'Common' },
            { value: 'uncommon', title: 'Uncommon' },
            { value: 'rare', title: 'Rare' },
            { value: 'very rare', title: 'Very Rare' },
            { value: 'legendary', title: 'Legendary' },
            { value: 'artefact', title: 'Artefact' },
          ],
          selected: magicItem.rarity,
          onSelectedChange: rarity => onMagicItemChange({ ...magicItem, rarity }),
        })),
        h(CopperAttributeTag, {
          //classList: [styles.attribute],
          label: h('span', { class: styles.attributeLabel }, 'Requires Attunement'),
          alignment: 'right'
        }, h(EditorCheckboxInput, {
          checked: magicItem.requiresAttunement,
          onCheckedChange: requiresAttunement => onMagicItemChange({ ...magicItem, requiresAttunement }),
        })),
      ]),
      h('div', { class: styles.description }, [
        h(RichTextSimpleEditor, {
          node: proseNodeJSONSerializer.deserialize(magicItem.description),
          onNodeChange: node => onMagicItemChange({
            ...magicItem,
            description: proseNodeJSONSerializer.serialize(node)
          })
        })
      ])
    ]),
  ])
}