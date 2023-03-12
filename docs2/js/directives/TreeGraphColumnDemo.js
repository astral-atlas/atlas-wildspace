// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
import { h, createId, useMemo } from "@lukekaalim/act";
import { ExpandToggleInput, TreeGraphColumn } from "@astral-atlas/wildspace-components";
import { FramePresenter } from "./presentation";

const cyrb53 = (str, seed = 0) => {
  let h1 = 0xdeadbeef ^ seed,
    h2 = 0x41c6ce57 ^ seed;
  for (let i = 0, ch; i < str.length; i++) {
    ch = str.charCodeAt(i);
    h1 = Math.imul(h1 ^ ch, 2654435761);
    h2 = Math.imul(h2 ^ ch, 1597334677);
  }
  
  h1 = Math.imul(h1 ^ (h1 >>> 16), 2246822507) ^ Math.imul(h2 ^ (h2 >>> 13), 3266489909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2246822507) ^ Math.imul(h1 ^ (h1 >>> 13), 3266489909);
  
  return 4294967296 * (2097151 & h2) + (h1 >>> 0);
};

export const TreeGraphColumnDemo/*: Component<>*/ = () => {
  const rootNodes = useMemo(() => [
    { name: 'Root Node', id: createId(), children: [
      { name: 'Hello', id: createId(), children: [] },
      { name: 'With Children', id: createId(), children: [
        { name: 'Child', id: createId(), children: [] },
        { name: 'Child 2', id: createId(), children: [] },
        { name: 'With Children', id: createId(), children: [
          { name: 'Child', id: createId(), children: [] },
          { name: 'Child 2', id: createId(), children: [] },
        ] },
      ] },
      { name: 'World', id: createId(), children: [] },
      { name: 'With Children', id: createId(), children: [
        { name: 'Child', id: createId(), children: [] },
        { name: 'Child 2', id: createId(), children: [] },
        { name: 'With Children', id: createId(), children: [
          { name: 'Child', id: createId(), children: [] },
          { name: 'Child 2', id: createId(), children: [] },
        ] },
      ] },
    ] }
  ], []);
  const selectedNodes = new Set([

  ]);
  const renderNode = ({ depth, expanded, id, onExpandedChange, showExpanded, hidden }) => {
    const style = {
      marginLeft: `${depth}rem`,
      display: hidden ? 'none' : 'flex',
      backgroundColor: `hsl(${cyrb53(id) % 360}deg, 50%, 50%)`,
      color: 'white',
    };
    return h('div', { style }, [showExpanded && h(ExpandToggleInput, { expanded, onExpandedChange }), id])
  };

  return [
    h(FramePresenter, {},
      h(TreeGraphColumn, { rootNodes, selectedNodes, renderNode })),
    h('pre', { style: { overflow: 'auto', background: 'black', color: 'white', padding: '1rem', borderRadius: '1rem' }},[
      TreeGraphColumnDemo.toString()
    ])
  ]
}