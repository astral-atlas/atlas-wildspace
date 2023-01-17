// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { ScaledLayoutDemo } from "../demo";
import { TagDropdown } from "@astral-atlas/wildspace-components";
import { repeat, createMockTag } from "@astral-atlas/wildspace-test";
import { h, useMemo, useState } from "@lukekaalim/act";

export const TestPage/*: Component<>*/ = () => {
  const allTags = useMemo(() => repeat(() => createMockTag(), 10), []);
  const [selectedTagsIds, setSelectedTags] = useState([]);
  
  return [
    h(ScaledLayoutDemo, { style: { backgroundColor: 'white' }}, [
      h(TagDropdown, {
        allTags,
        selectedTagsIds,
        onSelectedTagIdsChange: setSelectedTags
      }),
    ]),
    h('pre', {}, JSON.stringify(selectedTagsIds
        .map(st => allTags.find(at => at.id === st))
        .filter(Boolean)
        .map(t => t.id), null, 2)
    ),
  ];
};