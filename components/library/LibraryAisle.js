// @flow strict
/*::
import type { Component, ElementNode } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act";
import classes from './Library.module.css';

/*::
export type LibraryAisleProps = {
  focus?: 'workstation' | 'floor',

  floor?: ElementNode,
  desk?: ?ElementNode,
  workstation?: ?ElementNode,
  wideDesk?: boolean
};
*/

export const LibraryAisle/*: Component<LibraryAisleProps>*/ = ({
  floor,
  desk,
  focus = 'floor',
  workstation,
  wideDesk = false
}) => {
  const offset = focus === 'floor' ? "0%" : "calc(-100% + var(--deskWidth,16rem))"

  return h('div', { class: classes.aisleViewport }, [
    h('div', { class: classes.aisle, style: { transform: `translate(${offset})` } }, [
      h('div', { class: classes.floorViewport }, floor),
      !!desk && h('div', { classList: [classes.deskViewport] }, desk),
      !! workstation && h('div', { class: classes.workstationViewport }, workstation),
    ])
  ]);
};
