// @flow strict
/*::
import type { WildspaceController, RoomRoute } from "@astral-atlas/wildspace-components";
import type { Component } from "@lukekaalim/act";
import type { CubicBezierAnimation } from "@lukekaalim/act-curve";
import type { UserID } from "@astral-atlas/sesame-models";
*/

import { CompassLayout, CompassLayoutMinimap, GameOverlay, getContentRenderData, PlaylistPlayer, RoomOverlay, SceneRenderer2, useElementKeyboard, useKeyboardTrack, useMiniTheaterController2, useMiniTheaterState, useRoomPageMiniTheaterResources } from "@astral-atlas/wildspace-components";
import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import { allScreens, useRoomController } from "./useRoomController";
import { RoomControlScreen } from "./screens/RoomControlScreen";
import { RoomLibraryScreen } from "./screens/RoomLibraryScreen";

import styles from './WildspaceRoomPage.module.css';
import { Vector2 } from "three";
import { calculateCubicBezierAnimationPoint, maxSpan, useAnimatedNumber, useTimeSpan } from "@lukekaalim/act-curve";
import { RoomLobbyScreen } from "./screens/RoomLobbyScreen";
import { RoomSceneScreen } from "./screens/RoomSceneScreen";

/*::
export type WildspaceRoomPageProps = {
  userId: UserID,
  loadingAnim: CubicBezierAnimation,
  route: RoomRoute,
  wildspace: WildspaceController,
};
*/

export const WildspaceRoomPage/*: Component<WildspaceRoomPageProps>*/ = ({
  wildspace,
  route,
  userId,
  loadingAnim,
}) => {
  const roomController = useRoomController(wildspace, route, userId);
  if (!roomController)
    return null;
  
  const ref = useRef();

  const [roomLoadAnim] = useAnimatedNumber(roomController ? 1 : 0, 0, { duration: 1000, impulse: 3 })

  const playerScreens = [
    { content: h(RoomSceneScreen, { roomController }), position: new Vector2(0, 0) },
    //{ content: 'Initiative', position: new Vector2(-1, 0) },
    //{ content: 'Wiki', position: new Vector2(1, 0) },
    //{ content: h(RoomLobbyScreen, { roomController }), position: new Vector2(0, 1) },
    //{ content: 'Toolbox', position: new Vector2(0, -1) },
  ]
  const gmScreens = [
    ...playerScreens,
    ...[
      //{ content: h(RoomControlScreen, { roomController }), position: new Vector2(-1, -1) },
      { content: h(RoomLibraryScreen, { roomController }), position: new Vector2(-1, 1) },
      //{ content: 'Something', position: new Vector2(1, -1) },
      //{ content: 'Something', position: new Vector2(1, 1) },
    ]
  ]
  const screens = roomController.isGM ? gmScreens : playerScreens;

  useTimeSpan(maxSpan([loadingAnim.span, roomLoadAnim.span]), (now) => {
    const { current: div } = ref;
    if (!div)
      return;
    const loadingPoint = calculateCubicBezierAnimationPoint(loadingAnim, now);
    const roomLoadingPoint =  calculateCubicBezierAnimationPoint(roomLoadAnim, now);
    div.style.opacity = Math.min(loadingPoint.position, roomLoadingPoint.position);
  }, [loadingAnim, roomLoadAnim])
  const player = roomController.gamePage.players.find(p => p.userId === roomController.userId);

  const { state, resources: { audioPlaylists, audioTracks } } = roomController.roomPage;
  const assets = roomController.assets;
  const { scene: { content }, audio } = state 

  const resources = useRoomPageMiniTheaterResources(roomController.gamePage, roomController.roomPage);

  const miniTheaterId = (
    (content.type === 'mini-theater' && content.miniTheaterId)
    || (content.type === 'exposition' && content.exposition.background.type === 'mini-theater' &&
        content.exposition.background.miniTheaterId)
    || null
  )
  
  const controller = useMiniTheaterController2(
    miniTheaterId, resources, roomController.updates,
    roomController.isGM
  );
  const miniTheaterState = useMiniTheaterState(controller);
  const keys = useElementKeyboard(ref);

  const sceneContentRenderData = getContentRenderData(
    content,
    miniTheaterState,
    controller,
    assets,
    keys,
  ) || { background: { type: 'color', color: 'white' }, foreground: { type: 'none' } };

  const { playback } = audio;
  const playlist = playback.type === 'playlist'
    && audioPlaylists.find(p => p.id === playback.playlist.id)
    || null;
  const tracks = playlist &&
    playlist.trackIds
      .map(tid => audioTracks.find(t => t.id === tid))
      .filter(Boolean)

  return [
    h('div', { className: styles.room, ref, tabIndex: 0 }, [
      !!sceneContentRenderData && h(SceneRenderer2, { sceneContentRenderData }),
      !!playlist && !!tracks && state.audio.playback.type === 'playlist' &&
        h(PlaylistPlayer, {
          playlists: [playlist],
          assets,
          state: state.audio.playback.playlist,
          tracks,
          volume: roomController.volume.music
        }),
      h(RoomOverlay, {
        name: player && player.name,
        sesameURL: new URL(wildspace.config.www.sesame.httpOrigin),
        volume: roomController.volume.music,
        onVolumeInput: roomController.setMusicVolume,
        onFullscreenClick: wildspace.toggleFullscreen,
        direction: roomController.screenPosition,
        screens: Object.keys(allScreens),
        screen: route.screen,
        gameUpdatesConnection: roomController.updates.updates,
        reconnectGameUpdates: roomController.reconnectGameUpdates,
        onScreenChange: screen => roomController.router.setRoute({ ...route, screen })
      }),
    ])
  ];
}