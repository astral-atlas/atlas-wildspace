// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/
import { AssetGrid, AssetGridItem } from "@astral-atlas/wildspace-components";
import { h, useState } from "@lukekaalim/act";

export const AssetGridDemo/*: Component<>*/ = () => {
  const [count, setCount] = useState(10);
  
  return [
    h('label', {}, [
      'Assets',
      h('input', { type: 'range', value: count, onInput: e => setCount(e.target.valueAsNumber) }),
    ]),
    h(AssetGrid, { style: { height: '40vh', width: '100%', border: '1px solid black' }}, [
      ...Array.from({ length: count })
        .map((_, i) => {
          const backgroundColor = `hsl(${Math.random() * 255}, 50%, 50%)`;
          return h(AssetGridItem, {}, [
            h('div', { style: { width: '100%', height: '100%', backgroundColor } })
          ])
        })
    ])
  ]
};