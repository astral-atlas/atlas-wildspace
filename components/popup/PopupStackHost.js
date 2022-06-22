// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { PopupStackController } from "./usePopupStack";
*/
/*::

export type PopupStackHostProps = {
  popup: PopupStackController,
};
*/

export const PopupStackHost/*: Component<PopupStackHostProps>*/ = ({
  popup,
}) => {
  if (popup.stack.length < 1)
    return null;

  return null;
}