// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Vector2 } from "three";
import type { CompassLayoutScreen } from "../layout/CompassLayout";
import type { GameUpdatesConnection } from "@astral-atlas/wildspace-client2";

*/
import { CompassLayoutMinimap } from "../layout/CompassLayout";
import { CornersLayout } from "../layout/CornersLayout";
import { FullscreenToggle } from "../ui/FullscreenToggle";
import { UserTablet } from "../user/UserTablet";
import { MiniVolumeControl } from "../volume/MiniVolumeControl";
import { h } from "@lukekaalim/act"
import { ScreenSelector } from "./ScreenSelector";
import { RoomConnectionStatus } from "./RoomConnectionStatus";

/*::
export type RoomOverlayProps = {
  onFullscreenClick?: () => mixed,

  sesameURL: URL,
  name: ?string,
  onLogoutClick?: () => mixed,
  volume: number,
  onVolumeInput?: number => mixed,
  screens: string[],
  screen: string,
  onScreenChange: string => mixed,
  gameUpdatesConnection: GameUpdatesConnection,
  reconnectGameUpdates: () => mixed,
};
*/

export const RoomOverlay/*: Component<RoomOverlayProps>*/ = ({
  onFullscreenClick = _ => {},

  sesameURL,
  name,
  onLogoutClick = _ => {},

  volume,
  onVolumeInput = _ => {},

  gameUpdatesConnection,
  reconnectGameUpdates,

  screen,
  screens,
  onScreenChange,
}) => {
  return h(CornersLayout, {
    topLeft: [
      h(FullscreenToggle, { onFullscreenClick }),
    ],
    topRight: [
      !!name && h(UserTablet, { sesameURL, name: name, onLogoutClick }),
    ],
    bottomLeft: [
      h(RoomConnectionStatus, { gameUpdatesConnection, reconnectGameUpdates }),
      h(ScreenSelector, { screen, screens, onScreenChange }),
      h(MiniVolumeControl, { volume, onVolumeInput }),
    ],
  });
}