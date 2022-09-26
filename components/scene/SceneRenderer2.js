// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { SceneContent } from "@astral-atlas/wildspace-models";

import type { MiniTheaterController2 } from "../miniTheater/useMiniTheaterController2";
import type { AssetDownloadURLMap } from "../asset/map";
*/
import { h, useEffect, useState } from "@lukekaalim/act";
import { SceneContentForegroundRenderer } from "./SceneContentForegroundRenderer";
import { SceneContentBackgroundRenderer } from "./SceneContentBackgroundRenderer";
import { SceneContainer } from "./SceneContainer";

/*::
export type SceneRenderer2Props = {
  content: SceneContent,
  isContentEditable?: boolean,
  onContentUpdate?: SceneContent => mixed,
  assets?: AssetDownloadURLMap,
  miniTheaterController?: ?MiniTheaterController2,
}
*/

export const SceneRenderer2/*: Component<SceneRenderer2Props>*/ = ({
  content,
  isContentEditable = false,
  onContentUpdate,
  miniTheaterController = null,
  assets = new Map(),
}) => {
  const [miniTheaterState, setMiniTheaterState] = useState(null)
  useEffect(() => {
    if (!miniTheaterController)
      return
    const { unsubscribe } = miniTheaterController.subscribe((state) => {
      setMiniTheaterState(state)
    });
    return () => {
      unsubscribe();
    }
  }, [content, miniTheaterController])

  return h(SceneContainer, {}, [
    h(SceneContentBackgroundRenderer, {
      assets,
      content,
      miniTheaterState,
      miniTheaterController,
    }),
    h(SceneContentForegroundRenderer, {
      assets,
      content,
      miniTheaterState,
      miniTheaterController,
    }),
  ]);
};
