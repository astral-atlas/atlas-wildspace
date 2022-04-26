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
    }
  };

  return [fullscreenElement, setFullscreen];
}