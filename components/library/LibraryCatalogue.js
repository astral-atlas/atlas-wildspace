// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
*/

import { h } from "@lukekaalim/act"
import classes from './Library.module.css';
import seedrandom from 'seedrandom';

/*::
export type LibraryCatalogueProps = {
  onActivateAisle?: (id: string) => mixed,
  activeAisleId: ?string,
  aisles: {
    id: string,
    title: string,
    color?: string,
  }[]
};
*/

export const LibraryCatalogue/*: Component<LibraryCatalogueProps>*/ = ({
  onActivateAisle = _ => {},
  activeAisleId,
  aisles
}) => {
  return h('div', { className: classes.catalogue }, [
    h('menu', {}, aisles.map(aisle => {
      const accentColor = aisle.color || `hsl(${seedrandom(aisle.id)() * 360}, 50%, 50%)`;
      const onClick = () => {
        onActivateAisle(aisle.id)
      }

      return h('li', {}, h('button', {
        style: {
          ['--accentColor']: accentColor
        },
        onClick,
        classList: [classes.catalogueOption, aisle.id === activeAisleId && classes.selected],
        disabled: aisle.id === activeAisleId
      }, aisle.title));
    }))
  ]);
}