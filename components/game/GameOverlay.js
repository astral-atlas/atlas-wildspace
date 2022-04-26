// @flow strict
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type {
  LobbyMessage,
  LobbyMessageContent, LobbyConnection,
  Character, Player
} from "@astral-atlas/wildspace-models";
import type { User } from "@astral-atlas/sesame-models";
import type { Component } from "@lukekaalim/act";

*/
import { h } from "@lukekaalim/act";
import { CornersLayout } from "../layout/CornersLayout";
import { FullscreenToggle } from "../ui";
import { UserTablet } from "../user/UserTablet";


/*::
export type GameOverlayProps = {
  onFullscreenClick?: () => mixed,

  sesameURL: URL,
  name: ?string,
  onLogoutClick?: () => mixed,

  volume: number,
  onVolumeInput?: number => mixed,
};
*/

export const GameOverlay/*: Component<GameOverlayProps>*/ = ({
  onFullscreenClick = _ => {},

  sesameURL,
  name,
  onLogoutClick = _ => {},

  volume,
  onVolumeInput = _ => {}
}) => {
  return h(CornersLayout, {
    topLeft: h(FullscreenToggle, { onFullscreenClick }),
    topRight: name && h(UserTablet, { sesameURL, name: name, onLogoutClick }),
    bottomLeft: h('input', { type: 'range', value: volume, min: 0, max: 1, step: 0.01, onInput: e => onVolumeInput(e.target.valueAsNumber) })
  });
}