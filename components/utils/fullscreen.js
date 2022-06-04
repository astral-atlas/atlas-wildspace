// @flow strict

import { useEffect, useState } from "@lukekaalim/act";

export const useFullscreen = ()/*: [?Element, (?Element) => void]*/ => {
  const [fullscreenElement, setFullscreenElement] = useState(null);
  useEffect(() => {
    document.addEventListener('fullscreenchange', (e/*: Event*/) => {
      setFullscreenElement(document.fullscreenElement);
    })
  }, []);

  const setFullscreen = (element) => {
    if (!element) {
      document.exitFullscreen();
    } else {
      element.requestFullscreen();
      if (element instanceof HTMLElement && !element.contains(document.activeElement)) {
        element.focus();
      }
    }
  };

  return [fullscreenElement, setFullscreen];
}