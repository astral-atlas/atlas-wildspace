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

  const playerConnections = players.map(player => {
    const connection = lobbyConnections.find(c => player.userId === c.userId);
    return [player, connection]
  })
  const connectedPlayers = playerConnections.filter(([p, c]) => c);
  const disconnectedPlayers = playerConnections.filter(([p, c]) => !c);

  return [
    h('div', { className: styles.playerConnectionContainer }, [
      h('span', {}, 'Players Connected: '),
      h('ul', { className: styles.playerConnectionList }, [
        connectedPlayers.map(([player, connection]) =>
          h('li', {}, h(PlayerConnection, { player, connection }))),
          disconnectedPlayers.map(([player]) =>
          h('li', {}, h(PlayerConnection, { player, connection: null })))
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
  return h('div', { classList: [styles.playerConnection, connection ? styles.connected : styles.disconnected] }, [
    player.name,
    h('span', { className: styles.spacer }),
    h('img', { src: connection ? connectedIconURL : disconnectedIconURL })
  ])
}