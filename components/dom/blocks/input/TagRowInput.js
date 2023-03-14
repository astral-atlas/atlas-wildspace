// @flow strict

import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import styles from './TagRowInput.module.css';
import { nanoid } from 'nanoid/non-secure';
import blackCrossCircleURL from './assets/black-cross-circle.svg';
import blackPlusCircleURL from './assets/black-plus-circle.svg';
import stringHash from "@sindresorhus/string-hash";
import { DropdownLayout, DropdownRootPortal, DropdownRowLayout } from "../layout";
/*::
import type { Component } from "@lukekaalim/act";
import type { Tag, TagID } from "@astral-atlas/wildspace-models";
*/

/*::
export type TagRowInputProps = {
  attachedTagIds: $ReadOnlyArray<TagID>,
  allTags: $ReadOnlyArray<Tag>,

  placeholder?: string,
  onEvent?: (
    | { type: 'detach-tag', tagId: TagID }
    | { type: 'attach-tag', tagId: TagID }
    | { type: 'submit-new-tag', tagTitle: string }
  ) => mixed,
}
*/

export const TagRowInput/*: Component<TagRowInputProps>*/ = ({
  placeholder,
  attachedTagIds,
  allTags,
  onEvent = _ => {}
}) => {
  const [focus, setFocus] = useState(false);
  const [newTagTitle, setNewTagText] = useState('');

  const onInternalEvent = (event) => {
    switch (event.type) {
      case 'set-search':
        return setNewTagText(event.search);
      case 'submit-new-tag':
        setNewTagText('');
        return onEvent(event);
      case 'detach-tag':
      case 'attach-tag':
        return onEvent(event);
    }
  }
  const resetFocus = () => {
    const { current: row } = ref;
    const { current: dropdown } = dropdownRef;
    if (!row || !dropdown) return;

    setFocus((prevFocus) => {
      const { activeElement } = document;
      const invalidFocusTarget = (
        !row.contains(document.activeElement) ||
        (
          (
            activeElement instanceof HTMLButtonElement ||
            activeElement instanceof HTMLInputElement
          ) && activeElement.disabled
        )
      )
      console.log({ invalidFocusTarget })
      if (prevFocus && invalidFocusTarget) {
        row.focus();
      }
      return prevFocus
    })
  };

  useEffect(() => {
    const { current: row } = ref;
    const { current: dropdown } = dropdownRef;
    const { body } = document;

    if (!row || !body || !dropdown) return;
    const onMutation = (m) => {
      resetFocus();
    };
    const observer = new MutationObserver(onMutation);
    observer.observe(row, {
      subtree: true,
      childList: true,
      attributeFilter: ['disabled']
    });
    observer.observe(dropdown, {
      subtree: true,
      childList: true,
      attributeFilter: ['disabled']
    })

    return () => {
      observer.disconnect()
    }
  }, []);
  const ref = useRef/*:: <?HTMLElement>*/(null);
  const dropdownRef = useRef/*:: <?HTMLElement>*/(null);
  
  return h('div', {
    class: styles.tagRow,
    ref,
    tabIndex: -1,
    onFocusIn: () => setFocus(true),
    onFocusOut: () => setFocus(false)
  }, [
    h('div', { style: { display: 'flex', overflowX: 'auto', paddingBottom: '16px' }},
      attachedTagIds
        .map(id => allTags.find(t => t.id === id))
        .filter(Boolean)
        .map(tag =>
          h(TagButton, {
            key: tag.id,
            tagTitle: tag.title,
            tagColor: `hsl(${stringHash(tag.id) % 360}deg, 50%, 70%)`,
            action: 'remove',
            onAction: () => onInternalEvent({ type: 'detach-tag', tagId: tag.id })
          }))
    ),
    h(TagSearchInput, {
      search: newTagTitle,
      placeholder,
      onEvent: onInternalEvent,
    }),
    h(DropdownRootPortal, { parentRef: ref, ref: dropdownRef }, 
      h(TagDropdown, {
        hidden: !focus,
        newTagTitle,
        allTags,
        attachedTagIds,
        onFocusIn: () => setFocus(true),
        onFocusOut: () => setFocus(false),
        onEvent: onInternalEvent,
      }))
  ]);
};

/*::
export type TagButtonProps = {
  tagColor: string,
  tagTitle: string,

  action?: 'none' | 'add' | 'remove',
  onAction?: () => mixed,

  disabled?: boolean,
}
*/

export const TagButton/*: Component<TagButtonProps>*/ = ({
  tagColor,
  tagTitle,

  action = 'none',
  onAction = _ => {},

  disabled = false,
}) => {
  return h('button', {
    class: styles.tagButton,
    style: { backgroundColor: tagColor },
    onClick: onAction,
    disabled,
  }, [
    h('span', {}, tagTitle),
    action === 'add' && h('img', { class: styles.tagButtonIcon, src: blackPlusCircleURL }),
    action === 'remove' && h('img', { class: styles.tagButtonIcon, src: blackCrossCircleURL }),
  ])
}

/*::
export type TagSearchInputProps = {
  search: string,

  onEvent?: (
    | { type: 'set-search', search: string }
    | { type: 'submit-new-tag', tagTitle: string }
  ) => mixed
  ,
  placeholder?: string,
};
*/

export const TagSearchInput/*: Component<TagSearchInputProps>*/ = ({
  search,
  onEvent = _ => {},
  placeholder = "Add or search tags"
}) => {

  const onKeyDown = (event/*: KeyboardEvent*/) => {
    if (event.key !== 'Enter')
      return;
    event.preventDefault();
    onEvent({ type: 'submit-new-tag', tagTitle: search });
  }
  const onInput = (event) => {
    onEvent({ type: 'set-search', search: event.target.value });
  }

  return h('input', {
    class: styles.tagNameInput,
    type: 'text',

    value: search,
    placeholder,

    onKeyDown,
    onInput,
  });
}

const TagDropdown = ({
  hidden,
  
  newTagTitle, allTags, attachedTagIds,

  onFocusIn, onFocusOut,

  onEvent = _ => {}
}) => {
  const hasText = !!newTagTitle.trim();

  const unattachedTags = allTags
    .filter(t => !attachedTagIds.includes(t.id))

  const includedTags = unattachedTags
    .filter(t => !hasText || t.title.toLowerCase().includes(newTagTitle.trim().toLowerCase()))
  const excludedTags = unattachedTags
    .filter(t => !includedTags.find(it => it.id === t.id))

  return h(DropdownLayout, { hidden, onFocusIn, onFocusOut }, [
    h(DropdownRowLayout, {}, [
      h('span', { class: styles.tagDropdownSectionTitle }, `Add custom tag: `),
      h(TagButton, {
        tagTitle: newTagTitle,
        tagColor: 'white',
        action: 'add',
        disabled: !hasText,
        onAction: () => onEvent({ type: 'submit-new-tag', tagTitle: newTagTitle })
      }),
    ]),
    includedTags.length > 0 && [
      h(DropdownRowLayout, {},
        h('div', { class: styles.tagDropdownSectionTitle }, hasText ? 'Included tags:' : 'Existing tags:' )
      ),
      h(DropdownRowLayout, {},
        h(TagBlock, {}, includedTags
          .map(tag =>
            h(TagButton, {
              key: tag.id,
              tagTitle: tag.title,
              tagColor: `hsl(${stringHash(tag.id) % 360}deg, 50%, 70%)`,
              action: 'add',
              onAction: () => onEvent({ type: 'attach-tag', tagId: tag.id })
            }))
      )),
    ],
    excludedTags.length > 0 && [
      h(DropdownRowLayout, {},
        h('div', { class: styles.tagDropdownSectionTitle }, 'Excluded tags:')
      ),
      h(DropdownRowLayout, {},
        h(TagBlock, {}, excludedTags
          .map(tag =>
            h(TagButton, {
              key: tag.id,
              tagTitle: tag.title,
              tagColor: `hsl(${stringHash(tag.id) % 360}deg, 50%, 70%)`,
              disabled: true,
            }))
      )),
    ]
  ]);
}
export const TagBlock/*: Component<>*/ = ({ children }) => {
  return h('div', { class: styles.tagBlock }, children)
}