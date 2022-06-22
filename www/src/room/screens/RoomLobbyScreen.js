// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { RoomController } from "../useRoomController";
*/
import { PlayerConnectionList } from "@astral-atlas/wildspace-components";
import { h } from "@lukekaalim/act";
import { WindowScreen } from "./WindowScreen";

export const RoomLobbyScreen/*: Component<{ roomController: RoomController }>*/ = ({ roomController }) => {
  const { gamePage, roomPage } = roomController;
  const { players, roomLobbies } = gamePage;
  const { room } = roomPage;

  const lobbyPair = roomLobbies.find(([roomId, lobby]) => room.id === roomId);
  const lobby = lobbyPair && lobbyPair[1];

  return h(WindowScreen, {}, [
    !!lobby && h(PlayerConnectionList, { lobbyConnections: lobby.playersConnected, players }),
    h('button', {
      onClick: () => roomController.router.setRoute({
        page: "game",
        path: "/",
        gameId: roomController.gamePage.game.id
      })
    }, "Exit Room")
  ])
};