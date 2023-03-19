// @flow strict
/*::
import type { Component } from "@lukekaalim/act/component";
*/

import { FramePresenter } from "../presentation/FramePresenter";
import { TagBoxTreeColumn } from "@astral-atlas/wildspace-components";
import { h } from "@lukekaalim/act";
import { nanoid } from "nanoid/non-secure";

export const TagBoxTreeColumnDemo/*: Component<>*/ = () => {
  const idA = nanoid();
  const idB = nanoid();
  const idC = nanoid();

  const rootNodes = [
    { id: idA, children: [
      { id: idB, children: [] },
      { id: idC, children: [] },
    ] },
  ];
  const nodeDetails = new Map([
    [idA, { color: `hsl(${Math.random() * 360}deg, 40%, 80%)`, tags: [
      { title: 'mytag', color: 'purple' },
      { title: 'your tag', color: 'orange' },
    ], title: 'Red' }],
    [idB, { color: `hsl(${Math.random() * 360}deg, 40%, 80%)`, tags: [], title: 'Green' }],
    [idC, { color: `hsl(${Math.random() * 360}deg, 40%, 80%)`, tags: [], title: 'Blue' }],
  ]);
  return h(FramePresenter, {},
    h(TagBoxTreeColumn, { nodeDetails, rootNodes }));
}