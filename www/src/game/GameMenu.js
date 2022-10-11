// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { GameController } from "./useGameController";
*/

import {
  MenuGameBreak, MenuGameColumn,
  MenuGameDescriptor, MenuGameIdEditor,
  MenuGamePrepButton, MenuGameRoomButton
} from "@astral-atlas/wildspace-components"
import { h } from "@lukekaalim/act"

/*::
export type GameMenuProps = {
  gameController: GameController,
};
*/

export const GameMenu/*: Component<GameMenuProps>*/ = ({
  gameController,
}) => {
  return [
    h(MenuGameColumn, {}, [
      h(MenuGameIdEditor, {
        games: gameController.games,
        selectedGameId: gameController.selectedGame.id,
        onSelectedGameChange: gameId => gameController.router.setRoute({
          page: 'game',
          path: '/',
          gameId,
        })
      }),
      h(MenuGameBreak),
      h(MenuGamePrepButton, {
        onClick: () => gameController.router.setRoute({
          page: 'game',
          path: '/prep',
          gameId: gameController.gamePage.game.id,
        }),
      }),
      h(MenuGameBreak),
      h(MenuGameDescriptor, {}, `Rooms`),
      gameController.gamePage.rooms.map(room => {
        const connections = gameController.gamePage.roomConnectionCounts.find(({ roomId }) => roomId === room.id);

        return h(MenuGameRoomButton, {
          connections: connections ? connections.count : 0,
          roomName: room.title,
          onClick: () => gameController.router.setRoute({
            page: 'room',
            path: '/room',
            gameId: gameController.gamePage.game.id,
            roomId: room.id,
            screen: 'lobby',
          })
        })
      }),
    ])
  ]
}