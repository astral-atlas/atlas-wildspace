// @flow strict
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type { WildspaceController, RoomRoute, AssetDownloadURLMap, SwampResources } from '@astral-atlas/wildspace-components';
import type { UpdatesConnection } from '@astral-atlas/wildspace-client2';
import type { RoomPage, GamePage } from '@astral-atlas/wildspace-models';
import type { Ref } from "@lukekaalim/act";
*/
import { useGamePage, useRoomPage, useUpdates } from "../updates";
import { Vector2 } from "three";
/*::

export type RoomController = {
  ...WildspaceController,

  userId: UserID,
  route: RoomRoute,

  isGM: boolean,

  roomPage: RoomPage,
  gamePage: GamePage,
  updates: UpdatesConnection,
  reconnectGameUpdates: () => void,
  assets: AssetDownloadURLMap,

  screenPosition: Vector2,

  swampResources: SwampResources,
  volume: {
    music: number,
  },
  setMusicVolume: (musicVolume: number) => void,

  roomBackgroundRef: Ref<?HTMLElement>,
}
*/

import { useCompassKeysDirection, useSwampResources } from "@astral-atlas/wildspace-components";
import { useEffect, useMemo, useRef, useState } from "@lukekaalim/act";

export const playerScreens/*: { [string]: Vector2 }*/ = {
  'scene':      new Vector2(0, 0),
  'initiative': new Vector2(-1, 0),
  'wiki':       new Vector2(1, 0),
  'lobby':      new Vector2(0, 1),
  'toolbox':    new Vector2(0, -1),
}
export const allScreens/*: { [string]: Vector2 }*/ = {
  ...playerScreens,
  'room':       new Vector2(-1, -1),
  'game':       new Vector2(-1, 1),
  'status':     new Vector2(1, 1),
  'something':  new Vector2(1, 1),
}

export const useRoomController = (
  wildspace/*: WildspaceController*/,
  route/*: RoomRoute*/,
  userId/*: UserID*/,
)/*: ?RoomController*/ => {
  const [updateConnectionTime, setUpdateConnectionTime] = useState(Date.now());
  const reconnectGameUpdates = () => {
    setUpdateConnectionTime(Date.now())
  }
  const updates = useUpdates(wildspace.client, route.gameId, [updateConnectionTime]);
  const gamePage = useGamePage(updates);
  const roomPage = useRoomPage(route.roomId, updates);
  const [volume, setVolume] = useState/*:: <{ music: number }>*/({ music: 0 });
  const setMusicVolume = (music) => {
    setVolume(volume => ({ ...volume, music }))
  }

  const isGM = !!gamePage && userId === gamePage.game.gameMasterId;

  const assets = useMemo(() => gamePage && roomPage &&
    new Map([...gamePage.assets, ...roomPage.assets].map(a => [a.description.id, a])), [gamePage, roomPage]);
  const roomBackgroundRef = useRef();
  
  const validDirections = [
    ...Object.keys(isGM ? allScreens : playerScreens).map(k => allScreens[k])
  ]
  const screenPosition = route.screen ? allScreens[route.screen] : new Vector2(0, 0);
  const [, setDirection, emitter] = useCompassKeysDirection(wildspace.emitter, validDirections, (nextDirection) => {
    const nextScreen = Object.keys(allScreens).find(k => allScreens[k].equals(nextDirection));
    if (!nextScreen)
      return;
    wildspace.router.setRoute({ ...route, screen: nextScreen })
  }, screenPosition);

  const swampResources = useSwampResources();

  const roomController = updates && gamePage && roomPage && assets && swampResources && {
    ...wildspace,
    isGM,
    userId,
    emitter,
    updates,
    reconnectGameUpdates,
    route,
    assets,
    screenPosition,
    gamePage,
    roomPage,
    volume,
    setMusicVolume,
    swampResources,
    roomBackgroundRef,
  }

  return roomController;
}