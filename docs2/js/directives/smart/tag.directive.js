// @flow strict
import { TagRowInput } from "@astral-atlas/wildspace-components"
import { createMockTag, repeat } from "@astral-atlas/wildspace-test";
import { h, useMemo, useState } from "@lukekaalim/act"
import { FramePresenter } from "../presentation/FramePresenter"
import iconURL from './assets/smile.png';
/*::
import type { Component } from "@lukekaalim/act";
import type { Tag } from "@astral-atlas/wildspace-models";
*/

export const InlineTagInputDemo/*: Component<>*/ = () => {
  const [allTags, setAllTags] = useState/*:: <Tag[]>*/(
    () => repeat(() => createMockTag(), 10)
  );
  const [attachedTagIds, setAttachedTagIds] = useState/*:: <string[]>*/(
    () => allTags.slice(0, 2).map(t => t.id)
  );

  const onEvent = (event) => {
    switch (event.type) {
      case 'submit-new-tag':
        const newTag =  { ...createMockTag(), title: event.tagTitle };
        setAllTags([...allTags, newTag]);
        return setAttachedTagIds([...attachedTagIds, newTag.id]);
      case 'detach-tag':
        return setAttachedTagIds(attachedTagIds.filter(id => id !== event.tagId));
      case 'attach-tag':
        return setAttachedTagIds([...attachedTagIds, event.tagId]);
    }
  }

  return h(FramePresenter, {}, [
    h(TagRowInput, { attachedTagIds, allTags, onEvent })
  ])
}