// @flow strict
/*::
import type { TagID } from "../../../../models/game/tag";
import type { Tag } from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act/component";
*/

import { h, useMemo, useState } from "@lukekaalim/act"
import classes from './TagDropdown.module.css';
import { EditorTextInput, editorStyles } from "../../../editor/form";

/*::
export type TagDropdownProps = {
  allTags: $ReadOnlyArray<Tag>,

  selectedTagsIds: $ReadOnlyArray<TagID>,
  onSelectedTagIdsChange?: $ReadOnlyArray<TagID> => mixed,

  allowNewTagCreation?: boolean,
  onCreateNewTag?: (title: string) => mixed,
}
*/


export const TagDropdown/*: Component<TagDropdownProps>*/ = ({
  allTags,
  selectedTagsIds,
  onSelectedTagIdsChange = _ => {},
  onCreateNewTag,
  allowNewTagCreation = false
}) => {
  const [tagFilter, setTagFilter] = useState('');
  const selectedTagsSet = useMemo(() =>
    new Set(selectedTagsIds), [selectedTagsIds]);

  const onTagSelectedChange = (tag, selected) => {
    onSelectedTagIdsChange([
      ...selectedTagsIds.filter(st => st !== tag.id),
      ...(selected ? [tag.id] : []),
    ])
  };

  const trimmedTagFilter = tagFilter.trim();

  const allSelectedTags = allTags.filter(t => selectedTagsSet.has(t.id));
  const allUnselectedTags = allTags
    .filter(t => !selectedTagsSet.has(t.id));
  const filteredTags = allUnselectedTags
    .filter(t => t.title.toLocaleLowerCase().includes(trimmedTagFilter.toLocaleLowerCase()))

  const hiddenTagCount = allUnselectedTags.length - filteredTags.length;

  return [
    h('details', { class: editorStyles.editorRoot }, [
      h('summary', {}, `Tags (${selectedTagsIds.length})`),
      h('div', { class: classes.tagDropdown }, [
        h('div', { class: classes.tagListContainer }, [
          h(TagList, { tags: allSelectedTags, selectedTagsSet, onTagSelectedChange }),
        ]),
        h('hr'),
        h('details', {}, [
          h('summary', { class: classes.addTagsSummary }, 'Add Tags'),
          h(EditorTextInput, { label: 'Tag Filter', text: tagFilter, onTextInput: t => setTagFilter(t) }),
          h('div', { class: classes.tagListContainer }, [
            hiddenTagCount > 0 && h('span', { class: classes.tagInfo },`Hidden ${hiddenTagCount} tags`),
            h(TagList, { tags: filteredTags, selectedTagsSet, onTagSelectedChange }),
          ]),
          trimmedTagFilter.length > 0
            && allowNewTagCreation
            && !!onCreateNewTag
            && h('button', {
              class: classes.createTagButton,
              onClick: () => onCreateNewTag(trimmedTagFilter),
            },`Create tag: "${trimmedTagFilter}"`),
        ]),
      ])
    ])
  ];
}

const TagList = ({ tags, selectedTagsSet, onTagSelectedChange }) => {
  return h('ul', { class: classes.tagList }, tags.map(tag => {
    const selected = selectedTagsSet.has(tag.id);

    return h('li', { key: tag.id },
      h('label', {
        style: { '--tag-color': tag.color },
        classList: [classes.tagSticker, selected && classes.selected]
      }, [
        h('input', {
          type: 'checkbox',
          checked: selected,
          onChange: e => onTagSelectedChange(tag, e.target.checked)
        }),
        h('span', { class: classes.tagTitle }, tag.title)
      ]));
  }));
};