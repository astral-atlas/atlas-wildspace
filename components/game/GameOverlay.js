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

import type { MiniTheaterController } from "../miniTheater/useMiniTheaterController";
*/
import { h } from "@lukekaalim/act";
import { CornersLayout } from "../layout/CornersLayout";
import { FullscreenToggle } from "../ui";
import { UserTablet } from "../user/UserTablet";
import { MiniVolumeControl } from "../volume";
import styles from './GameOverlay.module.css';


/*::
export type GameOverlayProps = {
  onFullscreenClick?: () => mixed,

  sesameURL: URL,
  name: ?string,
  onLogoutClick?: () => mixed,
};
*/

export const GameOverlay/*: Component<GameOverlayProps>*/ = ({
  onFullscreenClick = _ => {},

  sesameURL,
  name,
  onLogoutClick = _ => {},
}) => {
  return h(CornersLayout, {
    topLeft: h(FullscreenToggle, { onFullscreenClick }),
    topRight: name && h(UserTablet, { sesameURL, name: name, onLogoutClick }),
  });
}
