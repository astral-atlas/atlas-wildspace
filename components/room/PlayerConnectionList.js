// @flow strict
/*::
import type { Component } from "@lukekaalim/act";
import type { Player, LobbyConnection } from "@astral-atlas/wildspace-models";
*/

import { h } from "@lukekaalim/act";
import connectedIconURL from './connected_icon.svg';
import disconnectedIconURL from './disconnected_icon.svg';

import styles from './PlayerConnectionList.module.css';

/*::
export type PlayerConnectionListProps = {
  players: $ReadOnlyArray<Player>,
  lobbyConnections: $ReadOnlyArray<LobbyConnection>,
};
*/
export const PlayerConnectionList/*: Component<PlayerConnectionListProps>*/ = ({ players, lobbyConnections }) => {
  return [
    h('div', { className: styles.playerConnectionContainer }, [
      h('span', {}, 'Players Connected: '),
      h('ul', { className: styles.playerConnectionList }, [
        players.map(player => {
          const connection = lobbyConnections.find(c => player.userId === c.userId);
          return h('li', {}, h(PlayerConnection, { player, connection }))
        })
      ])
    ])
  ]
}

/*::
export type PlayerConnectionProps = {
  player: Player,
  connection: ?LobbyConnection,
}
*/

export const PlayerConnection/*: Component<PlayerConnectionProps>*/ = ({ player, connection }) => {
  return h('div', { className: styles.playerConnection }, [
    player.name,
    h('span', { className: styles.spacer }),
    h('img', { src: connection ? connectedIconURL : disconnectedIconURL })
  ])
}