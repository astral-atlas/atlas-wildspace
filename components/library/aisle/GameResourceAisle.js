// @flow strict
/*::
import type { LibrarySelection } from "../librarySelection";
import type { AisleFocusController } from "../useAisleFocus";
import type { Component } from "@lukekaalim/act/component";
import type { ElementNode } from "@lukekaalim/act/element";
*/
import { LibraryAisle } from "../LibraryAisle";
import { LibraryFloor, LibraryFloorHeader } from "../LibraryFloor";
import { useLibrarySelection } from "../librarySelection";
import { useAisleFocus } from "../useAisleFocus";
import { h } from "@lukekaalim/act";

/*::
export type GameResourceLibraryAisleProps = {
  renderAisleContents: ({ focus: AisleFocusController, selection: LibrarySelection }) => {
    floor: ElementNode,
    desk: ElementNode,
    workstation: ElementNode,
  },
};
*/

export const GameResourceLibraryAisle/*: Component<GameResourceLibraryAisleProps>*/ = ({
  renderAisleContents,
}) => {
  const aisleSelection = useLibrarySelection();
  const aisleFocus = useAisleFocus();

  const floor = [
    h(LibraryFloor, {
      header: h(LibraryFloorHeader),
      selection: aisleSelection,
      shelves: []
    })
  ];
  const desk = [

  ];
  const workstation = [
    
  ];

  return [
    h(LibraryAisle, {
      focus: aisleFocus.focus,
      floor,
      desk,
      workstation,
    })
  ]
};
