// @flow strict
/*::
import type { UserID } from "@astral-atlas/sesame-models";
import type {
  LobbyMessage,
  LobbyMessageContent, LobbyConnection,
  Character, Player
} from "@astral-atlas/wildspace-models";
import type { Component } from "@lukekaalim/act";
*/

import { h, useEffect, useRef, useState } from "@lukekaalim/act";
import styles from './Lobby.module.css';

/*::
export type LobbyProps = {
  userId: UserID,
  players: $ReadOnlyArray<Player>,
  connections: $ReadOnlyArray<LobbyConnection>,
  characters: $ReadOnlyArray<Character>,
  messages: $ReadOnlyArray<LobbyMessage>,
  onMessageSubmit?: LobbyMessageContent => mixed
}
*/

export const Lobby/*: Component<LobbyProps>*/ = ({
  userId,
  messages,
  players,
  characters,
  connections,
  onMessageSubmit = _ => {}
}) => {
  const [stagingMessage, setStagingMessage] = useState('');
  const onSubmit = (event) => {
    event.preventDefault()
    if (!stagingMessage)
      return;

    onMessageSubmit({ type: 'user', userId, node: { type: 'plaintext', plaintext: stagingMessage } })
  }

  const uniqueUsers = [...new Set(connections.map(c => c.userId))]
  const connectedPlayers = uniqueUsers.map(userId => players.find(p => p.userId === userId)).filter(Boolean);

  const messageContainerRef = useRef/*:: <?HTMLOListElement>*/()

  useEffect(() => {
    const { current: messageContainer } = messageContainerRef;
    if (!messageContainer)
      return;
    messageContainer.scrollTo({ top: messageContainer.scrollHeight, behavior: 'smooth' });
  }, [messages])

  return [
    h('div', { classList: [styles.lobby] }, [
      h('ol', { classList: [styles.lobbyUserPane] }, connectedPlayers.map(player =>
        h('li', { classList: [styles.lobbyUser] }, h('strong', {}, player.name)))),
      h('div', { classList: [styles.lobbyMainContent] }, [
        h('ol', { className: styles.lobbyMessageContainer, ref: messageContainerRef }, messages.map(message =>
          h(LobbyMessageRenderer, { message, players, characters }))),
        h('form', { classList: [styles.lobbyMessageEditor], onSubmit }, [
          h('input', { type: 'submit', value: "Post Message" }),
          h('textarea', { value: stagingMessage, onInput: e => setStagingMessage(e.target.value) }),
        ])
      ]),
    ]),

  ];
}

const getLobbyMessageName = (content, players, characters) => {
  switch (content.type) {
    case 'character':
      const character = characters.find(c => c.id === content.characterId);
      if (!character)
        return null;
      return character.name;
    case 'user':
      const player = players.find(p => p.userId === content.userId);
      if (!player)
        return null;
      return player.name;
  }
}

const LobbyMessageRenderer = ({ message, players, characters }) => {
  const name = getLobbyMessageName(message.content, players, characters)

  return h('li', { className: styles.lobbyMessage }, [
    name && h('strong', {}, `${name}: `),
    h('span', {}, message.content.node.plaintext)
  ])
}