// @flow strict

import { useState } from "@lukekaalim/act";

/*::
export type AisleFocusController = {
  toggleFocus: () => void,
  focusFloor: () => void,
  focusWorkstation: () => void,
  setFocus: (focus: 'floor' | 'workstation') => void,
  focus: 'floor' | 'workstation'
};
*/

export const useAisleFocus = (
  initialFocus/*: 'floor' | 'workstation'*/ = 'floor'
)/*: AisleFocusController*/ => {
  const [focus, setFocus] = useState(initialFocus)
  const toggleFocus = () => {
    setFocus(focus === 'floor' ? 'workstation' : 'floor')
  }
  const focusFloor = () => {
    setFocus('floor');
  };
  const focusWorkstation = () => {
    setFocus('workstation');
  };
  return {
    toggleFocus,
    focusFloor,
    focusWorkstation,
    focus,
    setFocus,
  }
};