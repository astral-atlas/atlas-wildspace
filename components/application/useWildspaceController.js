// @flow strict
/*::
import type { Ref } from "@lukekaalim/act";
import type { Navigation } from "@lukekaalim/act-navigation";
import type { UserID } from "@astral-atlas/sesame-models";


import type { AppSetup } from "./useAppSetup";
import type { KeyboardStateEmitter } from "../keyboard";
import type { Router } from "./useRouter";
*/

import { useMemo, useRef, useState } from "@lukekaalim/act"
import { useRootNavigation } from "@lukekaalim/act-navigation";
import { useAppSetup } from "./useAppSetup";
import { useFullscreen } from "../utils/fullscreen";
import { useElementKeyboard } from "../keyboard/changes";
import { useRouter } from "./useRouter";

/*::
export type WildspaceController = {
  ...AppSetup,
  rootRef: Ref<?HTMLElement>,
  router: Router,

  toggleFullscreen: () => void,

  navigation: Navigation,
  emitter: KeyboardStateEmitter,
};
*/

export const useWildspaceController = (
  appSetup/*: ?AppSetup*/,
  rootRef/*: Ref<?HTMLElement>*/
)/*: ?WildspaceController*/ => {
  if (!appSetup)
    return null;
  
  const [currentElement, setFullscreenElement] = useFullscreen();

  const navigation = useRootNavigation();
  const emitter = useElementKeyboard(rootRef);
  const router = useRouter(navigation);

  return useMemo(() => {
    const toggleFullscreen = () => {
      const { current: root } = rootRef;
      if (!root)
        return;
      setFullscreenElement(currentElement !== root ? root : null);
    }

    const controller = {
      ...appSetup,
      rootRef,
      router,

      toggleFullscreen,

      navigation,
      emitter,
    };

    return controller;
  }, [appSetup, router, emitter, navigation, currentElement]);
}